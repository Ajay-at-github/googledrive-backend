const fileService = require("../services/file.service");

const getUploadUrl = async (req, res) => {
  try {
    const data = await fileService.getUploadUrl({
      fileName: req.body.fileName,
      mimeType: req.body.mimeType,
      folderId: req.body.folderId,
      user: req.user,
    });

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const saveMetadata = async (req, res) => {
  try {
    const file = await fileService.saveFileMetadata({
      ...req.body,
      user: req.user,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const downloadUrl = await fileService.downloadFile({
      fileId: req.params.fileId,
      user: req.user,
    });

    res.json({ downloadUrl });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    await fileService.deleteFile({
      fileId: req.params.fileId,
      user: req.user,
    });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getUploadUrl,
  saveMetadata,
  downloadFile,
  deleteFile,
};
