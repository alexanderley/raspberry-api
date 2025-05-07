// // This file contains logic where the video is converted from mp4 and mov to streamable formats like hls. 

// // IMPORTANT. Make shure that ffmpeg is installed on machine. Locally and later on the server itself!

// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static');
// const fs = require('fs');
// const path = require('path');

// ffmpeg.setFfmpegPath(ffmpegPath);

// const convertToHLS = (inputPath, outputDir, fileName) => {
//   return new Promise((resolve, reject) => {
//     fs.mkdirSync(outputDir, { recursive: true });

//     // Check if the input file has both video and audio streams
//     ffmpeg.ffprobe(inputPath, (err, metadata) => {
//       if (err) {
//         return reject(err);
//       }

//       // Check the number of streams in the input file
//       const hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio');
      
//       // formated sgement
//       const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

//       const outputOptions = [
//         "-preset veryfast",
//         "-g 48",
//         "-sc_threshold 0",
//         "-map 0:0",
//         "-f hls",
//         "-hls_time 10",
//         "-hls_list_size 0",
//         "-hls_segment_filename", path.join(outputDir, `${fileNameWithoutExt}_segment_%03d.ts`)
//       ];

//       // If audio stream exists, map the audio stream as well
//       if (hasAudio) {
//         outputOptions.push("-map 0:1");
//       }

//       ffmpeg(inputPath)
//         .outputOptions(outputOptions)
//         .output(path.join(outputDir, `${fileNameWithoutExt}_index.m3u8`))
//         .on('end', () => resolve(outputDir))
//         .on('error', reject)
//         .run();
//     });
//   });
// };

// module.exports = {
//    convertToHLS
//   };

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

const convertToHLS = (inputPath, outputDir, fileName) => {
  return new Promise((resolve, reject) => {
    // ==============================================
    // FILE SYSTEM WRITING LOGIC (Output directory creation)
    // ==============================================
    fs.mkdirSync(outputDir, { recursive: true }); // Creates output directory if it doesn't exist

    // ==============================================
    // VIDEO CONVERSION LOGIC (FFmpeg processing)
    // ==============================================
    // 1. First probe the input file to check streams
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      // Check audio stream existence
      const hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio');
      
      // Format output filenames
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

      // 2. Configure FFmpeg conversion options
      const outputOptions = [
        "-preset veryfast",  // Encoding preset
        "-g 48",             // GOP size
        "-sc_threshold 0",    // Scene change threshold
        "-map 0:0",          // Map first video stream
        "-f hls",            // Output format (HLS)
        "-hls_time 10",      // Segment duration (seconds)
        "-hls_list_size 0",  // Unlimited playlist size
        // ==============================================
        // FILE SYSTEM WRITING LOGIC (Segment file naming)
        // ==============================================
        "-hls_segment_filename", path.join(outputDir, `${fileNameWithoutExt}_segment_%03d.ts`)
      ];

      // Add audio mapping if exists
      if (hasAudio) {
        outputOptions.push("-map 0:1"); // Map first audio stream
      }

      // 3. Execute the conversion
      ffmpeg(inputPath)
        .outputOptions(outputOptions)
        // ==============================================
        // FILE SYSTEM WRITING LOGIC (Playlist file output)
        // ==============================================
        .output(path.join(outputDir, `${fileNameWithoutExt}_index.m3u8`))
        .on('end', () => resolve(outputDir)) // Conversion complete
        .on('error', reject)                 // Conversion failed
        .run();
    });
  });
};

module.exports = {
   convertToHLS
};