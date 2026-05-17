const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    serviceProvider: { type: String, required: true, trim: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reservedLimit: { type: Number, required: true, min: 1 },
    waitingLimit: { type: Number, required: true, min: 0 },
    /** Monotonic token sequence counter per queue */
    lastTokenNumber: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "open", "closed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", queueSchema);
