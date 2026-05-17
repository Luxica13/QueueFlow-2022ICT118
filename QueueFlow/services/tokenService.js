const Token = require("../models/token");
const Queue = require("../models/queue");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const estimateWaitMinutes = require("../utils/estimateTime");
const {
  TOKEN_STATUS,
  ACTIVE_STATUSES,
} = require("../constants/tokenStatus");

const POPULATE_USER = { path: "userId", select: "name phone email isDigital" };
const POPULATE_QUEUE = { path: "queueId", select: "name serviceProvider status" };

function formatToken(token) {
  const doc = token.toObject ? token.toObject() : token;
  return {
    ...doc,
    tokenLabel: `#${doc.tokenNumber}`,
  };
}

/** Count customers ahead in line (by token order, active only) */
async function getPositionInQueue(queueId, tokenNumber) {
  const ahead = await Token.countDocuments({
    queueId,
    tokenNumber: { $lt: tokenNumber },
    status: { $in: ACTIVE_STATUSES },
  });
  return ahead + 1;
}

async function enrichToken(token) {
  const position = await getPositionInQueue(token.queueId, token.tokenNumber);
  const reservedAhead = await Token.countDocuments({
    queueId: token.queueId,
    status: { $in: [TOKEN_STATUS.RESERVED, TOKEN_STATUS.SERVING] },
    tokenNumber: { $lt: token.tokenNumber },
  });

  return {
    ...formatToken(token),
    positionInQueue: position,
    estimatedWaitMinutes:
      token.status === TOKEN_STATUS.WAITING
        ? null
        : estimateWaitMinutes(reservedAhead),
  };
}

/** Allocate next token number using atomic $inc (no replica set required) */
async function allocateTokenNumber(queueId) {
  const queue = await Queue.findByIdAndUpdate(
    queueId,
    { $inc: { lastTokenNumber: 1 } },
    { new: true }
  );

  if (!queue) {
    throw new AppError("Queue not found", 404);
  }

  return { queue, tokenNumber: queue.lastTokenNumber };
}

async function joinQueue({ queueId, userId, addedByAdmin = false }) {
  const queue = await Queue.findById(queueId);
  if (!queue) throw new AppError("Queue not found", 404);
  if (queue.status !== "open") {
    throw new AppError("This queue is not open for joining", 400);
  }

  const existing = await Token.findOne({
    queueId,
    userId,
    status: { $in: ACTIVE_STATUSES },
  });

  if (existing) {
    throw new AppError("You already have an active token in this queue", 409);
  }

  const reservedCount = await Token.countDocuments({
    queueId,
    status: { $in: [TOKEN_STATUS.RESERVED, TOKEN_STATUS.SERVING] },
  });

  const waitingCount = await Token.countDocuments({
    queueId,
    status: TOKEN_STATUS.WAITING,
  });

  let status;
  let message;

  if (reservedCount < queue.reservedLimit) {
    status = TOKEN_STATUS.RESERVED;
    message = "Added to reserved queue";
  } else if (waitingCount < queue.waitingLimit) {
    status = TOKEN_STATUS.WAITING;
    message = "Reserved queue full. Added to waiting queue.";
  } else {
    throw new AppError("Queue is full for today", 400);
  }

  const { tokenNumber } = await allocateTokenNumber(queueId);

  const reservedAhead = await Token.countDocuments({
    queueId,
    status: { $in: [TOKEN_STATUS.RESERVED, TOKEN_STATUS.SERVING] },
    tokenNumber: { $lt: tokenNumber },
  });

  const token = await Token.create({
    queueId,
    userId,
    tokenNumber,
    status,
    addedByAdmin,
    estimatedWaitMinutes:
      status === TOKEN_STATUS.RESERVED
        ? estimateWaitMinutes(reservedAhead)
        : 0,
  });

  await token.populate([POPULATE_USER, POPULATE_QUEUE]);

  return {
    message,
    token: await enrichToken(token),
  };
}

async function getDeskBoard(queueId) {
  const queue = await Queue.findById(queueId);
  if (!queue) throw new AppError("Queue not found", 404);

  const tokens = await Token.find({ queueId })
    .populate(POPULATE_USER)
    .sort({ tokenNumber: 1 })
    .lean();

  const enriched = await Promise.all(
    tokens.map(async (t) => enrichToken(t))
  );

  const serving = enriched.find((t) => t.status === TOKEN_STATUS.SERVING) || null;
  const reserved = enriched.filter((t) => t.status === TOKEN_STATUS.RESERVED);
  const waiting = enriched.filter((t) => t.status === TOKEN_STATUS.WAITING);
  const completed = enriched.filter((t) => t.status === TOKEN_STATUS.COMPLETED);
  const cancelled = enriched.filter((t) => t.status === TOKEN_STATUS.CANCELLED);

  return {
    queue,
    serving,
    reserved,
    waiting,
    completed,
    cancelled,
    /** Active tokens in strict token order */
    activeInOrder: enriched.filter((t) => ACTIVE_STATUSES.includes(t.status)),
  };
}

async function callNext(queueId) {
  const serving = await Token.findOne({
    queueId,
    status: TOKEN_STATUS.SERVING,
  });

  if (serving) {
    throw new AppError(
      "A customer is already being served. Complete them first.",
      400
    );
  }

  const next = await Token.findOne({
    queueId,
    status: TOKEN_STATUS.RESERVED,
  }).sort({ tokenNumber: 1 });

  if (!next) {
    return { message: "No reserved customers waiting to be called" };
  }

  next.status = TOKEN_STATUS.SERVING;
  await next.save();
  await next.populate([POPULATE_USER, POPULATE_QUEUE]);

  return { message: "Customer called", token: await enrichToken(next) };
}

async function completeToken(tokenId) {
  const token = await Token.findById(tokenId);
  if (!token) throw new AppError("Token not found", 404);

  if (token.status !== TOKEN_STATUS.SERVING) {
    throw new AppError("Only the currently serving token can be completed", 400);
  }

  token.status = TOKEN_STATUS.COMPLETED;
  await token.save();

  // Auto-promote next reserved customer to serving
  const next = await Token.findOne({
    queueId: token.queueId,
    status: TOKEN_STATUS.RESERVED,
  }).sort({ tokenNumber: 1 });

  let promoted = null;
  if (next) {
    next.status = TOKEN_STATUS.SERVING;
    await next.save();
    await next.populate([POPULATE_USER, POPULATE_QUEUE]);
    promoted = await enrichToken(next);
  }

  await token.populate([POPULATE_USER, POPULATE_QUEUE]);

  return {
    message: promoted
      ? "Visit completed. Next customer is now being served."
      : "Visit completed.",
    token: await enrichToken(token),
    nowServing: promoted,
  };
}

async function cancelToken(tokenId, { userId, isAdmin }) {
  const token = await Token.findById(tokenId);
  if (!token) throw new AppError("Token not found", 404);

  if (!isAdmin && token.userId.toString() !== userId.toString()) {
    throw new AppError("You can only cancel your own queue entry", 403);
  }

  if (!ACTIVE_STATUSES.includes(token.status)) {
    throw new AppError("This token is no longer active", 400);
  }

  if (!isAdmin && token.status === TOKEN_STATUS.SERVING) {
    throw new AppError("Cannot cancel while you are being served", 400);
  }

  token.status = TOKEN_STATUS.CANCELLED;
  await token.save();
  await token.populate([POPULATE_USER, POPULATE_QUEUE]);

  return {
    message: "Queue entry cancelled",
    token: await enrichToken(token),
  };
}

/** Promote first WAITING customer to RESERVED (admin reserve) */
async function promoteWaitingToReserved(queueId) {
  const waiting = await Token.findOne({
    queueId,
    status: TOKEN_STATUS.WAITING,
  }).sort({ tokenNumber: 1 });

  if (!waiting) {
    return { message: "No waiting customers available" };
  }

  const queue = await Queue.findById(queueId);
  const reservedCount = await Token.countDocuments({
    queueId,
    status: { $in: [TOKEN_STATUS.RESERVED, TOKEN_STATUS.SERVING] },
  });

  if (reservedCount >= queue.reservedLimit) {
    throw new AppError("Reserved capacity is full", 400);
  }

  const reservedAhead = await Token.countDocuments({
    queueId,
    status: { $in: [TOKEN_STATUS.RESERVED, TOKEN_STATUS.SERVING] },
    tokenNumber: { $lt: waiting.tokenNumber },
  });

  waiting.status = TOKEN_STATUS.RESERVED;
  waiting.estimatedWaitMinutes = estimateWaitMinutes(reservedAhead);
  await waiting.save();
  await waiting.populate([POPULATE_USER, POPULATE_QUEUE]);

  return {
    message: "Customer promoted to reserved queue",
    token: await enrichToken(waiting),
  };
}

async function getTokenById(tokenId, { userId, isAdmin }) {
  const token = await Token.findById(tokenId)
    .populate(POPULATE_USER)
    .populate(POPULATE_QUEUE);

  if (!token) throw new AppError("Token not found", 404);

  if (!isAdmin && token.userId._id.toString() !== userId.toString()) {
    throw new AppError("You can only view your own token", 403);
  }

  return enrichToken(token);
}

async function getMyActiveTokens(userId) {
  const tokens = await Token.find({
    userId,
    status: { $in: ACTIVE_STATUSES },
  })
    .populate(POPULATE_QUEUE)
    .sort({ createdAt: -1 });

  return Promise.all(tokens.map((t) => enrichToken(t)));
}

async function adminRemoveToken(tokenId) {
  return cancelToken(tokenId, { userId: null, isAdmin: true });
}

module.exports = {
  joinQueue,
  getDeskBoard,
  callNext,
  completeToken,
  cancelToken,
  promoteWaitingToReserved,
  getTokenById,
  getMyActiveTokens,
  adminRemoveToken,
  getPositionInQueue,
};
