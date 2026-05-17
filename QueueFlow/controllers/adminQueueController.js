const asyncHandler = require("../middleware/asyncHandler");
const queueService = require("../services/queueService");

exports.list = asyncHandler(async (req, res) => {
  const queues = await queueService.listQueues();
  res.json({ success: true, queues });
});

exports.get = asyncHandler(async (req, res) => {
  const queue = await queueService.getQueue(req.params.id);
  res.json({ success: true, queue });
});

exports.create = asyncHandler(async (req, res) => {
  const queue = await queueService.createQueue(req.body);
  res.status(201).json({ success: true, queue });
});

exports.update = asyncHandler(async (req, res) => {
  const queue = await queueService.updateQueue(req.params.id, req.body);
  res.json({ success: true, queue });
});

exports.remove = asyncHandler(async (req, res) => {
  await queueService.deleteQueue(req.params.id);
  res.json({ success: true, message: "Queue deleted" });
});
