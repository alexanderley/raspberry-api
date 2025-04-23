require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");

// Create connection to Azure Storage
const accountName = process.env.AZURE_ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.AZURE_ACCOUNT_NAME;

// Establishes a connection with Azure Blob Storage
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
// const containerClient = blobServiceClient.getContainerClient(containerName);

async function testConnection(){
  try{
    const props = await blobServiceClient.getProperties();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    console.log('✓ Connection successful!');
    console.log(`Account SKU: ${props}`);
    console.log('XXXXXX containerclient: ', containerClient);
    return true;
  }catch(err){
    console.log('error: ',err.message)
  }
}
testConnection();

console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRunning!!!')

async function extractMetadata(headers) {
  const contentType = headers['content-type'];
  const fileType = contentType.split('/')[1];
  const contentDisposition = headers['content-disposition'] || '';
  const caption = headers['x-image-caption'] || 'No caption provided';
  const matches = /filename="([^"]+)"/i.exec(contentDisposition);
  const fileName = matches?.[1] || `image-${Date.now()}.${fileType}`;
  return { fileName, caption, fileType };
}

// #Todo: rename this, it should be general not specific for images
async function uploadStream(blobName, stream) {
  const blobClient = containerClient.getBlockBlobClient(blobName);
  await blobClient.uploadStream(dataStream);
  return blobClient.url;
}
  // #Todo: check with mongoDB -> This is client not the mongoose way!!!
  // # Important this code might go into the controler file

// async function storeMetadata(name, caption, fileType, imageUrl) {
//   const collection = client.db("tutorial").collection('metadata');
//   await collection.insertOne({ name, caption, fileType, imageUrl });
// }

// async function handleImageUpload(req, res) {
//   res.setHeader('Content-Type', 'application/json');
//   if (req.url === '/api/upload' && req.method === 'POST') {
//     try {
//       // Extract metadata from headers
//       const {fileName, caption, fileType } = await extractMetadata(req.headers);
//       // Upload the image as a to Azure Storage Blob as a stream
//       const imageUrl = await uploadImageStreamed(fileName, req);
//       // Store the metadata in MongoDB
//       await storeMetadata(fileName, caption, fileType, imageUrl);
//       res.writeHead(201);
//       res.end(JSON.stringify({ message: 'Image uploaded and metadata stored successfully', imageUrl }));
//     } catch (error) {
//       console.error('Error:', error);
//       res.writeHead(500);
//       res.end(JSON.stringify({ error: 'Internal Server Error' }));
//     }
//   } else {
//     res.writeHead(404);
//     res.end(JSON.stringify({ error: 'Not Found' }));
//   }
// }

module.exports = {
    testConnection,
    uploadStream,
    extractMetadata
  };
