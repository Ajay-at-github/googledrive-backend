const File = require("../models/file.model");
const Folder = require("../models/folder.model");
const s3Service = require("./s3.service");
const { v4: uuidv4 } = require("uuid");

const getUploadUrl = async ({ fileName, mimeType, folderId, user }) => {
  let path = "/";
  let s3Prefix = `${user._id}`;

  if (folderId) {
    const folder = await Folder.findOne({
      _id: folderId,
      ownerId: user._id,
    });

    if (!folder) {
      throw new Error("Folder not found");
    }

    path = folder.path;
    s3Prefix = `${user._id}${folder.path}`;
  }

  const uniqueFileName = `${uuidv4()}-${fileName}`;
  const s3Key = `${s3Prefix}/${uniqueFileName}`;

  const uploadUrl = await s3Service.generateUploadUrl({
    key: s3Key,
    contentType: mimeType,
  });

  return {
    uploadUrl,
    s3Key,
    path: `${path}/${fileName}`,
  };
};

const saveFileMetadata = async ({
  fileName,
  fileSize,
  mimeType,
  s3Key,
  folderId,
  path,
  user,
}) => {
  return File.create({
    fileName,
    fileSize,
    mimeType,
    s3Key,
    folderId: folderId || null,
    ownerId: user._id,
    path,
  });
};

const downloadFile = async ({ fileId, user }) => {
  const file = await File.findOne({
    _id: fileId,
    ownerId: user._id,
  });

  if (!file) {
    throw new Error("File not found");
  }

  const downloadUrl = await s3Service.generateDownloadUrl(file.s3Key);
  return downloadUrl;
};

const deleteFile = async ({ fileId, user }) => {
  const file = await File.findOne({
    _id: fileId,
    ownerId: user._id,
  });

  if (!file) {
    throw new Error("File not found");
  }

  await s3Service.deleteObject(file.s3Key);
  await File.deleteOne({ _id: file._id });
};

module.exports = {
  getUploadUrl,
  saveFileMetadata,
  downloadFile,
  deleteFile,
};
