const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const asyncHandler = require("./asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized. Please log in.", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new AppError("User no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch {
    throw new AppError("Invalid or expired token.", 401);
  }
});

module.exports = { protect };
