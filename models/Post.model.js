const mongoose = require("mongoose");
const {Schema, model } = mongoose;

const postSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    media_type: {
        type: String,
        enum: ["photo", "video"],
        required: true
    },
    media_url: {
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