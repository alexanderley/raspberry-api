const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// #Todo check if its break
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  username: {type: String, required: true},
  profilePicture: String,
  bio: String,
  followers: [{ 
    type: Schema.Types.ObjectId, 
    ref: "User",
    default: [] 
  }],
  following: [{ 
    type: Schema.Types.ObjectId, 
    ref: "User",
    default: []
  }],
  confirmed: {
    type: Boolean,
    default: false,
  },
  verificationToken: { type: String, required: true },

});

module.exports = model("User", userSchema);
