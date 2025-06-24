const express = require("express");
const router = express.Router();
const fs = require('fs');

// const videoFileMap = {
//   'cdn': "videos/cdn.mp4",
//   'generate-pass' : 'temp/waterfall.mp4',
//   'get-post': 'temp/waterfall.mp4',
// }
const videoFileMap = {
  'waterfall': "routes/temp/waterfall.mp4",
  'parfume' : 'routes/temp/parfume.mp4',
}

router.get('/streamVideo/:filename', async (req,res) => {
  console.log('req.params', req.params);
    try{
    const fileName = req.params.filename;
    const filePath = videoFileMap[fileName];
  
    if(!filePath){ 
      return res.status(404).send('File not found')
    }

    if(filePath){
      console.log('filePath exist', filePath)
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    // const range = req.header.range;
    const range = req.headers.range;

    if(stat){
      console.log('stat', stat);
    }

    if(range){
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, {start, end});

      // const file = fs.createReadStream(filePath, { start, end });
      // file.on('error', (err) => {
      //   console.error('Stream error:', err);
      //   res.status(500).end();
      // });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type' : 'video/mp4'
      };
      res.writeHead(206, head);
      file.pipe(res);
    }
    else{
      const head = {
        'Content-Length': fileSize,
        'Content-Type' : 'video/mp4'
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res)
    }
    }catch(err){
    res.status(500).json({
      success: false,
      error: err.message
    });
    }
})


module.exports = router;