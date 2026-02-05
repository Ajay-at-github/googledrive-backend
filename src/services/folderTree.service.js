const Folder = require("../models/folder.model");
const File = require("../models/file.model");

const buildFolderTree = async (folderId, ownerId) => {
  const folder = await Folder.findOne({ _id: folderId, ownerId });
  if (!folder) throw new Error("Folder not found");

  const files = await File.find({ folderId, ownerId });
  const subFolders = await Folder.find({
    parentFolderId: folderId,
    ownerId,
  });

  const children = [];
  for (const sub of subFolders) {
    children.push(await buildFolderTree(sub._id, ownerId));
  }

  return {
    folder,
    files,
    children,
  };
};

module.exports = { buildFolderTree };
