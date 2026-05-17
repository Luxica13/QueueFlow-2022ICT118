const asyncHandler = require("../middleware/asyncHandler");
const authService = require("../services/authService");
const { sanitizeUser } = require("../services/authService");

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, ...result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json({ success: true, ...result });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});
