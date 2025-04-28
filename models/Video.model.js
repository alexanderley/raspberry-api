const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const videoSchema = new Schema({
    name: { type: String, required: true },
    caption: { type: String, default: 'No caption provided' },
    fileType: { type: String, required: true },
    videoUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = model('Video', videoSchema);