const AppError = require("../utils/AppError");

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError("You do not have permission for this action.", 403);
  }
  next();
};

module.exports = { requireRole };
