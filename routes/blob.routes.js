const express = require("express");
const router = express.Router();
const Video = require("../models/Video.model");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

// curl -X POST http://localhost:5005/api/upload \
//   -H "Content-Type: video/mov" \
//   -H "Content-Disposition: attachment; filename=\"ley2.mov\"" \
//   -H "x-image-caption: My test video" \
//   --data-binary @./ley2.mov

// configuration for azure blob
const { containerClient } = require("../azure/azure.config");

// Function with upload logic
const {extractMetadata, uploadToBlob} = require('../controller/blob.controller');
const { convertToHLS } =  require("../controller/ffmpeg.controller");


// upload video to blob
router.post("/upload", async (req, res) => {
  try {
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

      // Creates a export directory(delete later!!!)
      const exportDir = path.join(__dirname, 'export');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const hlsData = await convertToHLS(tempFilePath, exportDir, fileName);

    } catch(err){
      console.log('error: ', err)
    }

    return

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
const contentType = mime.lookup('index.m3u8');
// NEW: Upload HLS folder to Azure Blob
const uploadHLSFolderToBlob = async (folderPath, blobPrefix) => {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const blobName = `${blobPrefix}/${file}`;
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadFile(filePath, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    console.log(`Uploaded: ${blobName}`);
  }
};


router.post("/uploadNew", async (req, res) => {
  try {
    // 1. Extract metadata
    const { fileName, caption, fileType, contentType } = extractMetadata(req.headers);
    const indexFileName = 'index.m3u8'

    const tempDir = path.join(__dirname, "temp");
    const exportDir = path.join(__dirname, "export");
    const tempFilePath = path.join(tempDir, fileName);

    console.log('dirname:', __dirname);
    console.log('tempDir: ', tempDir);
    console.log('exportDir: ', exportDir);
    console.log('tempFilePath', tempFilePath);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

    // 2. Save uploaded file locally
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(tempFilePath);
      req.pipe(writeStream).on("finish", resolve).on("error", reject);
    });

    // 3. Convert to HLS
    await convertToHLS(tempFilePath, exportDir, fileName);

    // const hlsFolderPath = path.join(exportDir, fileName); // export/fileName/
    // const blobPrefix = `hls/${fileName}`; // Azure virtual folder: hls/filename/

    const directoryName = fileName.split('.')[0];
    const hlsFolderPath = path.join(exportDir, directoryName); // export/fileName/

    //
    console.log('hlsFolderPath new: ', hlsFolderPath);
  
    const blobPrefix = `hls/${directoryName}`; // Azure virtual folder: hls/filename/

    // console.log('hlsFolderPath: ', hlsFolderPath);
    console.log('blobPrefix', blobPrefix);


    // 4. Upload folder to Azure Blob
    await uploadHLSFolderToBlob(hlsFolderPath, blobPrefix);
    return

    // 5. Construct URL to .m3u8 playlist
    const videoUrl = `https://${containerClient.accountName}.blob.core.windows.net/${containerClient.containerName}/${blobPrefix}/index.m3u8`;

    // 6. Save metadata in MongoDB
    const video = new Video({
      name: fileName,
      caption,
      fileType,
      videoUrl,
      blobName: `hls/${fileName}`,
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