// // This file contains filesystem logic in order to read and write files to the server
// // # TODO make shure that this logic is working?

// import fs from 'fs';
// import path from 'path';
// import { Router } from 'express';
// import { IncomingMessage } from 'http';

// const TEMP_DIR = path.join(__dirname, 'temp');
// const EXPORT_DIR = path.join(__dirname, 'export');

// // Ensures directory exists
// function ensureDirExists(dirPath: string) {
//   if (!fs.existsSync(dirPath)) {
//     fs.mkdirSync(dirPath, { recursive: true });
//   }
// }

// // Saves incoming stream to disk
// async function saveToTempFile(req: IncomingMessage, filePath: string): Promise<void> {
//   ensureDirExists(path.dirname(filePath));
//   const writeStream = fs.createWriteStream(filePath);
//   return new Promise((resolve, reject) => {
//     req.pipe(writeStream)
//       .on('finish', resolve)
//       .on('error', reject);
//   });
// }


// module.exports = {
//     ensureDirExists,
//     saveToTempFile
// }