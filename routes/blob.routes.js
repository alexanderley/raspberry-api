const express = require("express");
const router = express.Router();
const Video = require("../models/Video.model");

// configuration for azure blob
const { containerClient } = require("../azure/azure.config");

// Function with upload logic
const {extractMetadata, uploadToBlob} = require('../controller/blob.controller');

const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

console.log('ffmpeg path: ', 

)

// curl -X POST http://localhost:5005/api/upload \
//   -H "Content-Type: video/mov" \
//   -H "Content-Disposition: attachment; filename=\"ley2.mov\"" \
//   -H "x-image-caption: My test video" \
//   --data-binary @./ley2.mov

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