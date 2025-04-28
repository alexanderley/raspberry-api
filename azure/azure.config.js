require('dotenv').config();
const { BlobServiceClient } = require("@azure/storage-blob");

// Create connection to Azure Storage
const accountName = process.env.AZURE_ACCOUNT_NAME;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;

// Establishes a connection with Azure Blob Storage
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net/?${sasToken}`);

const containerClient = blobServiceClient.getContainerClient(containerName);

if (!accountName || !sasToken || !containerName) {
  throw new Error("Missing Azure Storage environment variables!");
}

async function testConnection(){
  try{
    const blobProps = await blobServiceClient.getProperties();
    const containerExists = await containerClient.exists();

    // console.log(`blobProps / Account SKU: ${blobProps}`);
    // console.log('Containerclient: ', containerClient);
    console.log('containerExist: ', containerExists);
    return true;
  }catch(err){
    console.log('error: ',err.message)
  }
}
testConnection();


module.exports = {
    testConnection,
    blobServiceClient,
    containerClient
  };
