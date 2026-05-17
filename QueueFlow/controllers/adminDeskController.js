const asyncHandler = require("../middleware/asyncHandler");
const tokenService = require("../services/tokenService");
const User = require("../models/user");
const AppError = require("../utils/AppError");

exports.getBoard = asyncHandler(async (req, res) => {
  const board = await tokenService.getDeskBoard(req.params.queueId);
  res.json({ success: true, ...board });
});

exports.callNext = asyncHandler(async (req, res) => {
  const result = await tokenService.callNext(req.body.queueId);
  res.json({ success: true, ...result });
});

exports.complete = asyncHandler(async (req, res) => {
  const result = await tokenService.completeToken(req.params.id);
  res.json({ success: true, ...result });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await tokenService.adminRemoveToken(req.params.id);
  res.json({ success: true, ...result });
});

exports.promoteWaiting = asyncHandler(async (req, res) => {
  const result = await tokenService.promoteWaitingToReserved(req.body.queueId);
  res.json({ success: true, ...result });
});

exports.joinForUser = asyncHandler(async (req, res) => {
  const { queueId, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const result = await tokenService.joinQueue({
    queueId,
    userId,
    addedByAdmin: true,
  });
  res.status(201).json({ success: true, ...result });
});

exports.listCustomers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password").sort({ name: 1 });
  res.json({ success: true, users });
});
