// convertToHLS.js

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

// Define the resolution variants for ABR
const variants = [
  { resolution: '1920x1080', bitrate: '5000k', name: '1080p' },
  { resolution: '1280x720',  bitrate: '2800k', name: '720p' },
  { resolution: '854x480',   bitrate: '1400k', name: '480p' },
];

const convertToHLS = (inputPath, outputDir, fileName) => {
  return new Promise((resolve, reject) => {
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const videoOutputDir = path.join(outputDir, fileNameWithoutExt);
    fs.mkdirSync(videoOutputDir, { recursive: true });

    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);

      const hasAudio = metadata.streams.some(s => s.codec_type === 'audio');
      const processes = [];

      // Step 1: Generate variant playlists
      variants.forEach(({ resolution, bitrate, name }) => {
        const variantDir = path.join(videoOutputDir, name);
        fs.mkdirSync(variantDir, { recursive: true });

        const command = ffmpeg(inputPath)
          .videoCodec('libx264')
          .size(resolution)
          .videoBitrate(bitrate)
          .outputOptions([
            '-preset veryfast',
            '-g 48',
            '-sc_threshold 0',
            '-hls_time 10',
            '-hls_playlist_type vod',
            `-hls_segment_filename ${path.join(variantDir, 'segment_%03d.ts')}`
          ])
          .output(path.join(variantDir, 'index.m3u8'));

        if (hasAudio) {
          command.audioCodec('aac').audioBitrate('128k');
        }

        const promise = new Promise((res, rej) => {
          command
            .on('end', res)
            .on('error', rej)
            .run();
        });

        processes.push(promise);
      });

      // Step 2: Wait for all variants to be processed
      Promise.all(processes)
        .then(() => {
          // Step 3: Generate master playlist
          const masterPlaylist = variants.map(({ name, resolution, bitrate }) => {
            const [w, h] = resolution.split('x');
            const bandwidth = parseInt(bitrate) * 1000; // convert to bits
            return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${name}/index.m3u8`;
          }).join('\n');

          const masterPath = path.join(videoOutputDir, 'master.m3u8');
          fs.writeFileSync(masterPath, `#EXTM3U\n${masterPlaylist}`);

          resolve({
            masterPlaylist: masterPath,
            variants: variants.map(v => ({
              resolution: v.resolution,
              path: path.join(videoOutputDir, v.name, 'index.m3u8')
            }))
          });
        })
        .catch(reject);
    });
  });
};

module.exports = {
  convertToHLS
};
