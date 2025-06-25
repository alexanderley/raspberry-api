const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// #Todo check if its break
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  username: String,
  profile_picture: String,
  bio: String,
  // followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  // following: [{ type: Schema.Types.ObjectId, ref: "User" }]
  confirmed: {
    type: Boolean,
    default: false,
  },
  verificationToken: { type: String, required: true },

});

module.exports = model("User", userSchema);
