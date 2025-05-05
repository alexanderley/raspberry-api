const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const convertToHLS = async (filename, filepath) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, 'hls', filename);
    const playlistPath = path.join(outputDir, 'playlist.m3u8');

    // Validate input file
    if (!fs.existsSync(filepath)) {
      return reject(new Error(`Input file does not exist: ${filepath}`));
    }
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(filepath)
      .outputOptions([
        '-c copy',            // Correct: copy both video and audio streams
        '-start_number 0',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls'
      ])
      .output(playlistPath)
      .on('error', (err) => {
        reject(new Error(`HLS conversion failed: ${err.message}`));
      })
      .on('end', () => {
        resolve({ playlistPath, outputDir });
      })
      .run();
  });
};

module.exports = convertToHLS;