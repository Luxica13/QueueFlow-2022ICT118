const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    queueType: {
      type: String,
      enum: ["reserved", "waiting"],
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    tokenLabel: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "reserved",
        "waiting",
        "pending-confirmation",
        "called",
        "completed",
        "cancelled",
        "rejected",
        "expired",
        "no-show",
      ],
      default: "reserved",
    },
    
    addedByAdmin: {
      type: Boolean,
      default: false,
    },

    confirmationRequired: {
      type: Boolean,
      default: false,
    },

    estimatedArrivalTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Token", tokenSchema);