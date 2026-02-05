const folderService = require("../services/folder.service");
const Folder = require("../models/folder.model");
const archiver = require("archiver");
const s3 = require("../config/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { buildFolderTree } = require("../services/folderTree.service");

const deleteFolder = async (req, res) => {
  const folder = await Folder.findOne({
    _id: req.params.id,
    ownerId: req.userId,
  });

  if (!folder) {
    return res.status(404).json({ message: "Folder not found" });
  }

  await folder.deleteOne();

  res.json({ message: "Folder deleted" });
};

const renameFolder = async (req, res) => {
  const { name } = req.body;

  const folder = await Folder.findOne({
    _id: req.params.id,
    ownerId: req.userId,
  });

  if (!folder) {
    return res.status(404).json({ message: "Folder not found" });
  }

  folder.name = name;
  await folder.save();

  res.json(folder);
};

const createFolder = async (req, res) => {
  try {
    const parentFolderId =
      req.body.parentFolderId ?? req.body.folderId ?? null;

    const folder = await folderService.createFolder({
      name: req.body.name,
      parentFolderId,
      user: req.user,
    });

    res.status(201).json({
      message: "Folder created successfully",
      folder,
    });
    console.log("USER:", req.user);
    console.log("BODY:", req.body);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const listFolders = async (req, res) => {
  try {
    const parentFolderId =
      req.query.parentFolderId ?? req.query.folderId ?? null;

    const folders = await folderService.listFolders({
      parentFolderId,
      user: req.user,
    });

    res.json(folders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const downloadFolderAsZip = async (req, res) => {
  try {
    const folderId = req.params.id;
    const ownerId = req.userId;

    const tree = await buildFolderTree(folderId, ownerId);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${tree.folder.name}.zip`
    );
    res.setHeader("Content-Type", "application/zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    const addToZip = async (node, basePath = "") => {
      const currentPath = `${basePath}${node.folder.name}/`;

      // add files
      for (const file of node.files) {
        const s3Stream = await s3.send(
          new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: file.s3Key,
          })
        );

        archive.append(s3Stream.Body, {
          name: `${currentPath}${file.fileName}`,
        });
      }

      // recurse
      for (const child of node.children) {
        await addToZip(child, currentPath);
      }
    };

    await addToZip(tree);
    await archive.finalize();
  } catch (err) {
    console.error("Folder zip error:", err);
    res.status(500).json({ message: "Failed to download folder" });
  }
};

module.exports = {
  createFolder,
  listFolders,
  deleteFolder,
  renameFolder,
  downloadFolderAsZip,
};
