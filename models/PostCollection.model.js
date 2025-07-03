const mongoose = require("mongoose");
const {Schema, model } = mongoose;

const postCollectionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }]
});

module.exports = model("PostCollection", postCollectionSchema);