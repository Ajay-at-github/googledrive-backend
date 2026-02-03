const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentFolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    path: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
folderSchema.index({ ownerId: 1 });
folderSchema.index({ parentFolderId: 1 });
folderSchema.index({ path: 1 });

module.exports = mongoose.model("Folder", folderSchema);
