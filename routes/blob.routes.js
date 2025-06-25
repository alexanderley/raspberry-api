const express = require("express");
const router = express.Router();
const Video = require("../models/Video.model");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

// Upload video via curl
// curl -X POST http://localhost:5005/api/upload \
//   -H "Content-Type: video/mov" \
//   -H "Content-Disposition: attachment; filename=\"ley2.mov\"" \
//   -H "x-image-caption: My test video" \
//   --data-binary @./ley2.mov

// Function with upload logic
const {extractMetadata, uploadToBlob} = require('../controller/blob.controller');
const { convertToHLS } =  require("../controller/ffmpeg.controller");

// upload video to blob
router.post("/upload", async (req, res) => {
  try {
    console.log('req body: ', req.body);
    // 1. Extract metadata from headers
    const { fileName, caption, fileType, contentType } = extractMetadata(req.headers);

    try {
      // Store the incoming data locally
      const tempDir = path.join(__dirname, 'temp');
      const tempFilePath = path.join(tempDir, fileName); 

      console.log('tempFilePath: ', tempFilePath);
    
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      // Save the incoming file to the server (assuming the file is in req.body)
      const writeStream = fs.createWriteStream(tempFilePath);
      
      // Wait for the file to finish uploading
      await new Promise((resolve, reject) => {
        req.pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject);   
      });

      // Creates a export directory
      const exportDir = path.join(__dirname, 'export');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Converts to streamable format
      await convertToHLS(tempFilePath, exportDir, fileName);

      // #TODO: delete the exported file
    } catch(err){
      console.log('error: ', err)
    }
    return
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


module.exports = router;