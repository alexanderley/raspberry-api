const {containerClient} = require("../azure/azure.config");

// needed for uploading hls files
// const mime = require("mime");
const fs = require("fs");
const path = require("path");

// Extract the meta data from the incoming reuest
function extractMetadata(headers) {
  const contentType = headers['content-type'] || 'application/octet-stream';
  const fileType = contentType.split('/')[1] || 'bin';
  const contentDisposition = headers['content-disposition'] || '';
  const caption = headers['x-image-caption'] || 'No caption provided';
  
  const matches = /filename="([^"]+)"/i.exec(contentDisposition);
  const fileName = matches?.[1] || `file-${Date.now()}.${fileType}`;
  
  return { fileName, caption, fileType, contentType };
}

// Upload to Azure Blob Storage -> works for single files only like mp4, mp4, mov etc.
async function uploadToBlob(blobName, readableStream, contentType) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadStream(readableStream, undefined, undefined, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
  return blockBlobClient.url;
}




// Upload folder structures with mime
module.exports = {
  extractMetadata,
  uploadToBlob,
};