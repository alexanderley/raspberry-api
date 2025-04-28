const express = require("express");
const router = express.Router();
const Video = require("../models/Video.model");
const { blobServiceClient, containerClient } = require("../azure/azure.config");
const stream = require("stream");

// Helper function to extract metadata from headers
function extractMetadata(headers) {
  const contentType = headers['content-type'] || 'application/octet-stream';
  const fileType = contentType.split('/')[1] || 'bin';
  const contentDisposition = headers['content-disposition'] || '';
  const caption = headers['x-image-caption'] || 'No caption provided';
  
  const matches = /filename="([^"]+)"/i.exec(contentDisposition);
  const fileName = matches?.[1] || `file-${Date.now()}.${fileType}`;
  
  return { fileName, caption, fileType, contentType };
}

// Upload to Azure Blob Storage
async function uploadToBlob(blobName, readableStream, contentType) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadStream(readableStream, undefined, undefined, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
  return blockBlobClient.url;
}

// upload video to blob
router.post("/upload", async (req, res) => {
  try {
    // 1. Extract metadata from headers
    const { fileName, caption, fileType, contentType } = extractMetadata(req.headers);

    // 2. Upload directly to Azure Blob Storage
    const videoUrl = await uploadToBlob(fileName, req, contentType);

    // 3. Store metadata in MongoDB
    const video = new Video({
      name: fileName,
      caption,
      fileType,
      videoUrl,
      blobName: fileName,          // Store blob reference
      container: containerClient.containerName,
      uploadedAt: new Date()
    });
    await video.save();

    res.status(201).json({
      success: true,
      videoId: video._id,
      fileName,
      videoUrl
    });

  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// get video preview (metadata)
router.get("/preview/:videoId", async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json({
      name: video.name,
      caption: video.caption,
      url: video.videoUrl,
      uploadedAt: video.uploadedAt
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// get video file (redirect to Azure URL)
router.get("/video/:videoId", async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video || !video.videoUrl) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.redirect(video.videoUrl);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;