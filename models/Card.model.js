const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const cardSchema = new Schema({
  title: String,
  buttonName: String,
  description: String,
});

module.exports = model("Card", cardSchema)