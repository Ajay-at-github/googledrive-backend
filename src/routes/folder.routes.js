const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const folderController = require("../controllers/folder.controller");

router.post("/", authMiddleware, folderController.createFolder);
router.get("/", authMiddleware, folderController.listFolders);

module.exports = router;
