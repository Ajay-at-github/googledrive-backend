const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const fileController = require("../controllers/file.controller");

router.post("/upload-url", authMiddleware, fileController.getUploadUrl);
router.post("/", authMiddleware, fileController.saveMetadata);
router.get("/:fileId/download", authMiddleware, fileController.downloadFile);
router.delete("/:fileId", authMiddleware, fileController.deleteFile);

module.exports = router;
