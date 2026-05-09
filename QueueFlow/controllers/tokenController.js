const Token = require("../models/Token");
const Queue = require("../models/Queue");
const estimateTime = require("../utils/estimateTime");

exports.joinQueue = async (req, res) => {
  try {
    const { queueId, userId } = req.body;

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({
        message: "Queue not found",
      });
    }

    queue.currentTokenNumber += 1;

    await queue.save();

    const token = await Token.create({
      queueId,
      userId,
      tokenNumber: queue.currentTokenNumber,
    });

    res.status(201).json({
      message: "Joined queue successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    if (!token) {
      return res.status(404).json({
        message: "Token not found",
      });
    }

    const peopleAhead = await Token.countDocuments({
      queueId: token.queueId,
      tokenNumber: { $lt: token.tokenNumber },
      status: "waiting",
    });

    res.json({
      tokenNumber: token.tokenNumber,
      positionInQueue: peopleAhead + 1,
      estimatedWaitTime: estimateTime(peopleAhead),
      status: token.status,
    });
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
      status: "waiting",
    }).sort({ tokenNumber: 1 });

    if (!nextToken) {
      return res.json({
        message: "No waiting users",
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

    token.status = "completed";

    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.skipToken = async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);

    token.status = "skipped";

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

    token.status = "cancelled";

    await token.save();

    res.json(token);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};