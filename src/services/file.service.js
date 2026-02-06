const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/file.model");

const generateUploadUrl = async ({
  userId,
  fileName,
  fileType,
  folderPath = "root",
}) => {
  if (!userId) {
    throw new Error("User ID is required to generate upload URL");
  }

  const fileKey = `${userId}/${folderPath}/${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300, // 5 minutes
  });

  return {
    uploadUrl,
    fileKey,
  };
};

const listFiles = async ({ userId, folderId }) => {
  const normalizedFolderId =
    !folderId || folderId === "null" || folderId === "undefined"
      ? null
      : folderId;

  return File.find({
    ownerId: userId,
    folderId: normalizedFolderId,
  }).sort({ createdAt: -1 });
};

const generateDownloadUrl = async (s3Key, options = {}) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET,
    Key: s3Key,
    ...(options.responseContentDisposition
      ? { ResponseContentDisposition: options.responseContentDisposition }
      : {}),
    ...(options.responseContentType
      ? { ResponseContentType: options.responseContentType }
      : {}),
  });

  const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300, // 5 minutes
  });

  return downloadUrl;
};

module.exports = {
  generateUploadUrl,
  listFiles,
  generateDownloadUrl,
};
