const express = require("express");
const router = express.Router();
const Video = require("../models/Video.model");

// configuration for azure blob
const { containerClient } = require("../azure/azure.config");

// Function with upload logic
const {extractMetadata, uploadToBlob} = require('../controller/blob.controller');


const convertToHLS = require('../controller/ffmpeg.controller');

console.log('converHLS: ', convertToHLS);

// curl -X POST http://localhost:5005/api/upload \
//   -H "Content-Type: video/mov" \
//   -H "Content-Disposition: attachment; filename=\"ley2.mov\"" \
//   -H "x-image-caption: My test video" \
//   --data-binary @./ley2.mov

// upload video to blob
router.post("/upload", async (req, res) => {
  try {
    console.log('req body: ', req.body);
    // 1. Extract metadata from headers
    const { fileName, caption, fileType, contentType } = extractMetadata(req.headers);

    // Convert to HLS

    // Store the incoming data locally
    const tempFilePath = path.join(__dirname, 'temp', fileName);

    // Save the incoming file to the server (assuming the file is in req.body)
    const writeStream = fs.createWriteStream(tempFilePath);
    req.pipe(writeStream);


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