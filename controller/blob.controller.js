const {containerClient} = require("../azure/azure.config");


function extractMetadata(headers) {
  const contentType = headers['content-type'] || 'application/octet-stream';
  const fileType = contentType.split('/')[1] || 'bin';
  const contentDisposition = headers['content-disposition'] || '';
  const caption = headers['x-image-caption'] || 'No caption provided';
  
  const matches = /filename="([^"]+)"/i.exec(contentDisposition);
  const fileName = matches?.[1] || `file-${Date.now()}.${fileType}`;
  
  return { fileName, caption, fileType, contentType };
}

// Upload to Azure Blob Storage
async function uploadToBlob(blobName, readableStream, contentType) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadStream(readableStream, undefined, undefined, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
  return blockBlobClient.url;
}



module.exports = {
  extractMetadata,
  uploadToBlob
};