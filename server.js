
require('dotenv').config();
const { ContainerClient, BlobServiceClient } = require("@azure/storage-blob");


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

const app = require("./app");
// ℹ️ Sets the PORT for our app to have access to it. If no env has been set, we hard code it to 3000
const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});


const express = require('express');



