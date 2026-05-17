const asyncHandler = require("../middleware/asyncHandler");
const tokenService = require("../services/tokenService");
const queueService = require("../services/queueService");

exports.listOpenQueues = asyncHandler(async (req, res) => {
  const queues = await queueService.listQueues({ status: "open" });
  res.json({ success: true, queues });
});

exports.join = asyncHandler(async (req, res) => {
  const result = await tokenService.joinQueue({
    queueId: req.body.queueId,
    userId: req.user._id,
    addedByAdmin: false,
  });
  res.status(201).json({ success: true, ...result });
});

exports.myTokens = asyncHandler(async (req, res) => {
  const tokens = await tokenService.getMyActiveTokens(req.user._id);
  res.json({ success: true, tokens });
});

exports.getToken = asyncHandler(async (req, res) => {
  const token = await tokenService.getTokenById(req.params.id, {
    userId: req.user._id,
    isAdmin: false,
  });
  res.json({ success: true, token });
});

exports.cancel = asyncHandler(async (req, res) => {
  const result = await tokenService.cancelToken(req.params.id, {
    userId: req.user._id,
    isAdmin: false,
  });
  res.json({ success: true, ...result });
});
