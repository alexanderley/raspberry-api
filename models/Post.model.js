const mongoose = require("mongoose");
const {Schema, model } = mongoose;

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    mediaType: {
        type: String,
        enum: ["photo", "video"],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    caption: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = model("Post", postSchema)