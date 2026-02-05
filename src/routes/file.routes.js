const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post(
  "/upload-url",
  authMiddleware,
  fileController.getUploadUrl
);
router.get("/", authMiddleware, fileController.listFiles);
router.post("/", authMiddleware, fileController.createFile);
router.delete("/:id", authMiddleware, fileController.deleteFile);
router.patch("/:id", authMiddleware, fileController.renameFile);
router.get("/:id/download-url", authMiddleware, fileController.getDownloadUrl);

module.exports = router;
