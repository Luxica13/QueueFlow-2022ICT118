const Queue = require("../models/Queue");

exports.createQueue = async (req, res) => {
  try {
    const {
      name,
      serviceProvider,
      startTime,
      endTime,
      reservedLimit,
      waitingLimit,
    } = req.body;

    const queue = await Queue.create({
      name,
      serviceProvider,
      startTime,
      endTime,
      reservedLimit,
      waitingLimit,
      status: "open",
    });

    res.status(201).json(queue);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getQueues = async (req, res) => {
  try {
    const queues = await Queue.find();

    res.json(queues);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};