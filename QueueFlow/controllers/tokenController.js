const Token = require("../models/Token");
const Queue = require("../models/Queue");
const User = require("../models/User");
const estimateTime = require("../utils/estimateTime");

exports.joinQueue = async (req, res) => {
  try {
    const { queueId, userId, addedByAdmin } = req.body;

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    const reservedCount = await Token.countDocuments({
      queueId,
      queueType: "reserved",
      status: {
        $in: ["reserved", "called", "pending-confirmation"],
      },
    });

    const waitingCount = await Token.countDocuments({
      queueId,
      queueType: "waiting",
      status: {
        $in: ["waiting", "pending-confirmation"],
      },
    });

    let token;

    // RESERVED QUEUE
    if (reservedCount < queue.reservedLimit) {
      queue.currentReservedToken += 1;

      await queue.save();

      const estimatedTime = estimateTime(reservedCount);

      token = await Token.create({
        queueId,
        userId,
        queueType: "reserved",
        tokenNumber: queue.currentReservedToken,
        tokenLabel: `R${queue.currentReservedToken}`,
        status: "reserved",
        addedByAdmin,
        estimatedArrivalTime: `${estimatedTime} minutes`,
      });

      return res.status(201).json({
        message: "Added to reserved queue",
        token,
      });
    }

    // WAITING QUEUE
    if (waitingCount < queue.waitingLimit) {
      queue.currentWaitingToken += 1;

      await queue.save();

      token = await Token.create({
        queueId,
        userId,
        queueType: "waiting",
        tokenNumber: queue.currentWaitingToken,
        tokenLabel: `W${queue.currentWaitingToken}`,
        status: "waiting",
        addedByAdmin,
      });

      return res.status(201).json({
        message: "Reserved queue full. Added to waiting queue.",
        token,
      });
    }

    return res.status(400).json({
      message: "Today's visit tokens have run out.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate("queueId")
      .populate("userId");

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.callNext = async (req, res) => {
  try {
    const { queueId } = req.body;

    const nextToken = await Token.findOne({
      queueId,
      queueType: "reserved",
      status: "reserved",
    }).sort({ tokenNumber: 1 });

    if (!nextToken) {
      return res.json({
        message: "No reserved users remaining",
      });
    }

    nextToken.status = "called";

    await nextToken.save();

    res.json(nextToken);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.completeToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    token.status = "completed";

    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.cancelToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    token.status = "cancelled";

    await token.save();

    res.json({
      message: "Token cancelled successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.offerWaitingSpot = async (req, res) => {
  try {
    const { queueId } = req.body;

    const waitingToken = await Token.findOne({
      queueId,
      queueType: "waiting",
      status: "waiting",
    })
      .sort({ tokenNumber: 1 })
      .populate("userId");

    if (!waitingToken) {
      return res.json({
        message: "No waiting users available",
      });
    }

    waitingToken.status = "pending-confirmation";
    waitingToken.confirmationRequired = true;

    await waitingToken.save();

    // DIGITAL USER
    if (waitingToken.userId.isDigital) {
      return res.json({
        message:
          "Confirmation request should be sent via SMS/app.",
        token: waitingToken,
      });
    }

    // MANUAL USER
    return res.json({
      message:
        "Admin-added waiting user detected. Please contact via phone call.",
      token: waitingToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.acceptWaitingSpot = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const queue = await Queue.findById(token.queueId);

    queue.currentReservedToken += 1;

    await queue.save();

    token.queueType = "reserved";
    token.status = "reserved";
    token.confirmationRequired = false;
    token.tokenNumber = queue.currentReservedToken;
    token.tokenLabel = `R${queue.currentReservedToken}`;

    await token.save();

    res.json({
      message: "Waiting user promoted to reserved queue",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.rejectWaitingSpot = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    token.status = "rejected";
  await token.save();

    res.json({
      message: "Waiting spot rejected",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};