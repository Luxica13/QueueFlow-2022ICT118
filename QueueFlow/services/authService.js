const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../utils/AppError");

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isDigital: user.isDigital,
    createdAt: user.createdAt,
  };
}

async function register({ name, email, phone, password }) {
  const exists = await User.findOne({ email });
  if (exists) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: "user",
  });

  const token = signToken(user._id);
  return { user: sanitizeUser(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user._id);
  return { user: sanitizeUser(user), token };
}

module.exports = {
  register,
  login,
  sanitizeUser,
};
