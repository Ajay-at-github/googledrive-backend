const fileService = require("../services/file.service");
const Folder = require("../models/folder.model");
const File = require("../models/file.model");
const { GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const { generateDownloadUrl } = require("../services/file.service");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const createFile = async (req, res) => {
  try {
    const { fileName, fileSize, mimeType, s3Key, folderId } = req.body;

    if (!fileName || !fileSize || !mimeType || !s3Key) {
      return res.status(400).json({ message: "Missing required file fields" });
    }

    const normalizedFolderId =
      !folderId || folderId === "null" || folderId === "undefined"
        ? null
        : folderId;

    let path = "root";

    if (normalizedFolderId) {
      const folder = await Folder.findOne({
        _id: normalizedFolderId,
        ownerId: req.userId,
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      path = folder.path;
    }

    const file = await File.create({
      fileName,
      fileSize,
      mimeType,
      s3Key,
      ownerId: req.userId,   // ✅ REQUIRED
      folderId: normalizedFolderId,
      path,                 // ✅ REQUIRED
    });

    res.status(201).json(file);
  } catch (err) {
    console.error("[CREATE FILE ERROR]", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    console.log("[DELETE FILE] Request params:", req.params);
    console.log("[DELETE FILE] File ID:", req.params.id);
    console.log("[DELETE FILE] User ID:", req.userId);

    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: "File ID is required" });
    }

    const file = await File.findOne({
      _id: req.params.id,
      ownerId: req.userId,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    console.log("[DELETE FILE] Found file:", file.name);

    // Delete from S3
    const bucketName = process.env.AWS_S3_BUCKET;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: file.s3Key,
      })
    );

    console.log("[DELETE FILE] Deleted from S3:", file.s3Key);

    await file.deleteOne();

    console.log("[DELETE FILE] ✅ File deleted successfully:", file.name);
    res.json({ message: "File deleted" });
  } catch (err) {
    console.error("[DELETE FILE] ❌ Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

const renameFile = async (req, res) => {
  const newFileName = req.body.fileName ?? req.body.name;

  if (!newFileName) {
    return res.status(400).json({ message: "fileName is required" });
  }

  const file = await File.findOne({
    _id: req.params.id,
    ownerId: req.userId,
  });

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  file.fileName = newFileName;
  await file.save();

  res.json(file);
};

const getUploadUrl = async (req, res) => {
  const { fileName, fileType, folderId } = req.body;

  if (!fileName) {
    return res.status(400).json({ message: "fileName required" });
  }

  const normalizedFolderId =
    !folderId || folderId === "null" || folderId === "undefined"
      ? null
      : folderId;

  let folderPath = "root";

  if (normalizedFolderId) {
    const folder = await Folder.findOne({
      _id: normalizedFolderId,
      ownerId: req.userId,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    folderPath = folder.path; // e.g. root/projects/2026
  }

  const result = await fileService.generateUploadUrl({
    userId: req.userId,
    fileName,
    fileType,
    folderPath,
  });

  res.json(result);
};

const listFiles = async (req, res) => {
  try {
    const files = await fileService.listFiles({
      userId: req.userId,
      folderId: req.query.folderId,
    });

    res.json(files);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getDownloadUrl = async (req, res) => {
  const file = await File.findOne({
    _id: req.params.id,
    ownerId: req.userId,
  });

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const forceDownload = req.query.download === "true";
  const contentDisposition = forceDownload
    ? `attachment; filename="${file.fileName}"`
    : undefined;

  const downloadUrl = await fileService.generateDownloadUrl(file.s3Key, {
    responseContentDisposition: contentDisposition,
    responseContentType: file.mimeType,
  });

  res.json({
    downloadUrl,
    fileName: file.fileName,
  });
};

module.exports = { createFile, getUploadUrl, deleteFile, renameFile, listFiles, getDownloadUrl };
