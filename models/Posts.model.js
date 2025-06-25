const mongoose = require("mongoose");
const {Schema, model } = mongoose;

const postsSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    posts:[{
        post_id: { type: Schema.Types.ObjectId, ref: "Post" },
        createdAt: { type: Date, default: Date.now }
    }],
});

module.exports = model("Posts", postsSchema);