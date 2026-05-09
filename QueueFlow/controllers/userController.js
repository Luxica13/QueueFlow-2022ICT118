const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { name, phone, isDigital } = req.body;

    const user = await User.create({
      name,
      phone,
      isDigital,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};