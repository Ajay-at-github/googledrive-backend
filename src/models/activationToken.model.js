const mongoose = require("mongoose");

const activationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // NO TTL index - we'll handle expiration in application code
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ActivationToken",
  activationTokenSchema
);
