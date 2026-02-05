const Folder = require("../models/folder.model");

const createFolder = async ({ name, parentFolderId, user }) => {
  let path;

  const normalizedParentFolderId =
    !parentFolderId || parentFolderId === "null" || parentFolderId === "undefined"
      ? null
      : parentFolderId;

  if (normalizedParentFolderId) {
    const parentFolder = await Folder.findOne({
      _id: normalizedParentFolderId,
      ownerId: user._id,
    });

    if (!parentFolder) {
      throw new Error("Parent folder not found");
    }

    path = `${parentFolder.path}/${name}`;
  } else {
    path = `root/${name}`;
  }

  const folder = await Folder.create({
    name,
    ownerId: user._id,
    parentFolderId: normalizedParentFolderId,
    path,
  });

  return folder;
};

const listFolders = async ({ parentFolderId, user }) => {
  const normalizedParentFolderId =
    !parentFolderId || parentFolderId === "null" || parentFolderId === "undefined"
      ? null
      : parentFolderId;

  return Folder.find({
    ownerId: user._id,
    parentFolderId: normalizedParentFolderId,
  }).sort({ createdAt: -1 });
};

module.exports = {
  createFolder,
  listFolders,
};
