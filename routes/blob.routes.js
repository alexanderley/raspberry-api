const express = require("express");
const router = express.Router();
const Video = require("../models/Video.model");
const {blobServiceClient, containerClient} = require("../azure/azure.config");

// upload video to blob
router.post("/upload", async(req, res) => {
   try {
    // MongoDB Meta storage
    const {name, caption, fileType} = req.body;
    const videoUrl = "https://test-url";
    const video = new Video({name, caption, fileType, videoUrl});
    await video.save();

    res.status(201).json({
        success: true,
        videoId: video._id,
        videoUrl
    });

   } catch(err){
    console.error("Upload failed", err);
    res.status(500).json({
        success: false,
        error: err.message
    });
   }
});


// get video preview
router.get("/preview/:videoId", (req, res) => {});

// get video file
router.get("/video/:videoId", (req, res) => {});

module.exports = router;