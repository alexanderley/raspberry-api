const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { uploadFileToBlob } = require('./azureUploadUtils'); // Your utility for uploading files

ffmpeg.setFfmpegPath(ffmpegPath);

// Converts a video file to HLS and returns the directory path with .m3u8 and .ts files
const convertToHLS = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });

    ffmpeg(inputPath)
      .outputOptions([
        "-preset veryfast",
        "-g 48",
        "-sc_threshold 0",
        "-map 0:0",
        "-map 0:1",
        "-f hls",
        "-hls_time 10",
        "-hls_list_size 0",
        "-hls_segment_filename", path.join(outputDir, 'segment_%03d.ts')
      ])
      .output(path.join(outputDir, 'index.m3u8'))
      .on('end', () => resolve(outputDir))
      .on('error', reject)
      .run();
  });
};

module.exports = {
   convertToHLS
  };