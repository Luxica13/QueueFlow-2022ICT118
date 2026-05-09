const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    currentTokenNumber: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Queue", queueSchema);