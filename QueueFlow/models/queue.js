const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    serviceProvider: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    reservedLimit: {
      type: Number,
      required: true,
    },

    waitingLimit: {
      type: Number,
      required: true,
    },

    currentReservedToken: {
      type: Number,
      default: 0,
    },

    currentWaitingToken: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["upcoming", "open", "closed"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Queue", queueSchema);