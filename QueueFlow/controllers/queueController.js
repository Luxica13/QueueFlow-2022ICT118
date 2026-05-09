const Queue = require("../models/Queue");

exports.createQueue = async (req, res) => {
  try {
    const queue = await Queue.create({
      name: req.body.name,
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