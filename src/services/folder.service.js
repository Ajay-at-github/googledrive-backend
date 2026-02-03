const Folder = require("../models/folder.model");

const createFolder = async ({ name, parentFolderId, user }) => {
  let path = `/${name}`;

  if (parentFolderId) {
    const parentFolder = await Folder.findOne({
      _id: parentFolderId,
      ownerId: user._id,
    });

    if (!parentFolder) {
      throw new Error("Parent folder not found");
    }

    path = `${parentFolder.path}/${name}`;
  }

  const folder = await Folder.create({
    name,
    ownerId: user._id,
    parentFolderId: parentFolderId || null,
    path,
  });

  return folder;
};

const listFolders = async ({ parentFolderId, user }) => {
  return Folder.find({
    ownerId: user._id,
    parentFolderId: parentFolderId || null,
  }).sort({ createdAt: -1 });
};

module.exports = {
  createFolder,
  listFolders,
};
