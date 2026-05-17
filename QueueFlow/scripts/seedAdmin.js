require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/user");

async function seed() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@queueflow.com";
  const exists = await User.findOne({ email });

  if (exists) {
    console.log("Admin user already exists:", email);
    process.exit(0);
  }

  await User.create({
    name: "System Admin",
    email,
    phone: "0000000000",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
    isDigital: true,
  });

  console.log("Admin created:", email);
  console.log("Password:", process.env.ADMIN_PASSWORD || "admin123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
