// This file contains logic where the video is converted from mp4 and mov to streamable formats like hls. 

// IMPORTANT. Make shure that ffmpeg is installed on machine. Locally and later on the server itself!

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

const convertToHSLLocal = (inputPath, outputDir, fileName) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });

    // Check if the input file has both video and audio streams
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      // Check the number of streams in the input file
      const hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio');
      
      // formated sgement
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

      const outputOptions = [
        "-preset veryfast",
        "-g 48",
        "-sc_threshold 0",
        "-map 0:0",
        "-f hls",
        "-hls_time 10",
        "-hls_list_size 0",
        "-hls_segment_filename", path.join(outputDir, `${fileNameWithoutExt}_segment_%03d.ts`)
      ];

      // If audio stream exists, map the audio stream as well
      if (hasAudio) {
        outputOptions.push("-map 0:1");
      }

      ffmpeg(inputPath)
        .outputOptions(outputOptions)
        .output(path.join(outputDir, `${fileNameWithoutExt}_index.m3u8`))
        .on('end', () => resolve(outputDir))
        .on('error', reject)
        .run();
    });
  });
};
const convertToHLS = (inputPath, outputDir, fileName) => {
  return new Promise((resolve, reject) => {

    // Create a sub directory
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const videoOutputDir = path.join(outputDir, fileNameWithoutExt);
    
    // Create the directory (and parent dictories if needed)
    // fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(videoOutputDir, { recursive: true });

    // Check if the input file has both video and audio streams
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      // Check the number of streams in the input file
      const hasAudio = metadata.streams.some(stream => stream.codec_type === 'audio');

      const outputOptions = [
        "-preset veryfast",
        "-g 48",
        "-sc_threshold 0",
        "-map 0:0",
        "-f hls",
        "-hls_time 10",
        "-hls_list_size 0",
        "-hls_segment_filename", path.join(videoOutputDir, 'segment_%03d.ts')
        // "-hls_segment_filename", path.join(outputDir, `${fileNameWithoutExt}_segment_%03d.ts`)
      ];

      // If audio stream exists, map the audio stream as well
      if (hasAudio) {
        outputOptions.push("-map 0:1");
      }

      // ffmpeg(inputPath)
      //   .outputOptions(outputOptions)
      //   .output(path.join(outputDir, `${fileNameWithoutExt}_index.m3u8`))
      //   .on('end', () => resolve(outputDir))
      //   .on('error', reject)
      //   .run();

      ffmpeg(inputPath)
        .outputOptions(outputOptions)
        // Playlist will be saved in the video-specific directory
        .output(path.join(videoOutputDir, 'index.m3u8'))
        .on('end', () => {
          // Return information about the generated files
          resolve({
            directory: videoOutputDir,
            playlistPath: path.join(videoOutputDir, 'index.m3u8'),
            segments: fs.readdirSync(videoOutputDir)
                       .filter(f => f.startsWith('segment_') && f.endsWith('.ts'))
                       .map(f => path.join(videoOutputDir, f))
          });
        })
        .on('error', reject)
        .run();
    }
  );
  });
};

module.exports = {
   convertToHLS
  };