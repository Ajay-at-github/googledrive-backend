const folderService = require("../services/folder.service");

const createFolder = async (req, res) => {
  try {
    const folder = await folderService.createFolder({
      name: req.body.name,
      parentFolderId: req.body.parentFolderId,
      user: req.user,
    });

    res.status(201).json({
      message: "Folder created successfully",
      folder,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const listFolders = async (req, res) => {
  try {
    const folders = await folderService.listFolders({
      parentFolderId: req.query.parentFolderId,
      user: req.user,
    });

    res.json(folders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  createFolder,
  listFolders,
};
