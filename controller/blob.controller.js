
// #TODO -> Check if controller work these need to be imported to the blob.routes file

const { MongoClient } = require('mongodb');
const blobStorage = require('./blob-storage');

// MongoDB setup
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function storeMetadata(name, caption, fileType, imageUrl) {
  try {
    await mongoClient.connect();
    const collection = mongoClient.db("tutorial").collection('metadata');
    await collection.insertOne({ 
      name, 
      caption, 
      fileType, 
      imageUrl, 
      createdAt: new Date() 
    });
  } finally {
    await mongoClient.close();
  }
}

async function handleImageUpload(req, res) {
  try {
    // Extract metadata
    const { fileName, caption, fileType } = blobStorage.extractMetadata(req.headers);
    
    // Upload to Azure
    const imageUrl = await blobStorage.uploadStream(fileName, req);
    
    // Store metadata
    await storeMetadata(fileName, caption, fileType, imageUrl);
    
    res.status(201).json({ 
      success: true,
      fileName,
      imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

module.exports = {
  handleImageUpload
};