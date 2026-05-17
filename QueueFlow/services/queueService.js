const Queue = require("../models/queue");
const AppError = require("../utils/AppError");

async function listQueues(filter = {}) {
  return Queue.find(filter).sort({ createdAt: -1 });
}

async function getQueue(id) {
  const queue = await Queue.findById(id);
  if (!queue) throw new AppError("Queue not found", 404);
  return queue;
}

async function createQueue(data) {
  return Queue.create({
    ...data,
    status: data.status || "open",
  });
}

async function updateQueue(id, data) {
  const queue = await Queue.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!queue) throw new AppError("Queue not found", 404);
  return queue;
}

async function deleteQueue(id) {
  const queue = await Queue.findByIdAndDelete(id);
  if (!queue) throw new AppError("Queue not found", 404);
  return queue;
}

module.exports = {
  listQueues,
  getQueue,
  createQueue,
  updateQueue,
  deleteQueue,
};
