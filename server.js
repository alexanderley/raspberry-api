
// require('dotenv').config();
// const { BlobServiceClient } = require("@azure/storage-blob");

// // Create connection to Azure Storage
// const accountName = process.env.AZURE_ACCOUNT_NAME;
// const sasToken = process.env.SAS_TOKEN;
// const containerName = process.env.AZURE_ACCOUNT_NAME;

// // Establishes a connection with Azure Blob Storage
// const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);
// // const containerClient = blobServiceClient.getContainerClient(containerName);

// async function testConnection(){
//   try{
//     const props = await blobServiceClient.getProperties();
//     const containerClient = blobServiceClient.getContainerClient(containerName);
//     console.log('✓ Connection successful!');
//     console.log(`Account SKU: ${props}`);
//     console.log('XXXXXX containerclient: ', containerClient);
//     return true;
//   }catch(err){
//     console.log('error: ',err.message)
//   }
// }
// testConnection();

// /////////////////////////////////////////////////////////////////////////////

// async function extractMetadata(headers) {
//   const contentType = headers['content-type'];
//   const fileType = contentType.split('/')[1];
//   const contentDisposition = headers['content-disposition'] || '';
//   const caption = headers['x-image-caption'] || 'No caption provided';
//   const matches = /filename="([^"]+)"/i.exec(contentDisposition);
//   const fileName = matches?.[1] || `image-${Date.now()}.${fileType}`;
//   return { fileName, caption, fileType };
// }

// async function uploadImageStreamed(blobName, dataStream) {
//   const blobClient = containerClient.getBlockBlobClient(blobName);
//   await blobClient.uploadStream(dataStream);
//   return blobClient.url;
// }
//   // check with mongoDB
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

/////////////////////////////////////////////////////////////////////////////

// Start express server
const app = require("./app");

// important to import the azureConfig!!
const azureConfig = require("./azure/azure.config")

// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});


const express = require('express');



