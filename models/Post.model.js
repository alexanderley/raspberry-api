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
    likes: [{types: Schema.Types.ObjectId, ref: "User"}],
    comments: [{
        user_id: {type: Schema.Types.ObjectId, ref: "User"},
        text: {type: String, required: true},
        createdAt: {type: Date, default: Date.now }
    }],
});

module.exports = model("Post", postSchema)