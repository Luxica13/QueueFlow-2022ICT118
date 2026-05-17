const mongoose = require("mongoose");
const { TOKEN_STATUS } = require("../constants/tokenStatus");

const tokenSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** Global join order within the queue (1, 2, 3…) */
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(TOKEN_STATUS),
      default: TOKEN_STATUS.RESERVED,
    },
    estimatedWaitMinutes: { type: Number, default: 0 },
    addedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One active token per user per queue
tokenSchema.index(
  { queueId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["WAITING", "RESERVED", "SERVING"] },
    },
  }
);

tokenSchema.index({ queueId: 1, tokenNumber: 1 });
tokenSchema.index({ queueId: 1, status: 1, tokenNumber: 1 });

module.exports = mongoose.model("Token", tokenSchema);
