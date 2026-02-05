const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const folderController = require("../controllers/folder.controller");

router.post("/", authMiddleware, folderController.createFolder);
router.get("/", authMiddleware, folderController.listFolders);
router.delete("/:id", authMiddleware, folderController.deleteFolder);
router.patch("/:id", authMiddleware, folderController.renameFolder);
router.get("/:id/download", authMiddleware, folderController.downloadFolderAsZip);

module.exports = router;
