import {BlobServiceClient} from '@azure/storage-blob';

const accountName = process.env.AZURE_ACCOUNT_NAMEE;
const sasToken = process.env.SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net${sasToken}`
);

const containerClient = blobServiceClient.getContainerClient(containerName);



export async function testConnection() {
    
// console.log("accountName", accountName);
// console.log("sasToken", sasToken);
// console.log("containerName", containerName);
// console.log("blobServiceClient", blobServiceClient);
    console.log("Testing Azure Blob Storage connection...");
    try {
      console.log("Testing Azure Blob Storage connection...");
      
      // List blobs (even if empty, this confirms the container is accessible)
      let i = 1;
      for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`Blob ${i++}: ${blob.name}`);
      }
  
      console.log("✅ Connection successful! Container is accessible.");
      return true;
    } catch (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }
  }

export {blobServiceClient,containerClient};

