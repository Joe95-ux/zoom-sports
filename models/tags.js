const mongoose = require("mongoose");
const slugify = require('slugify');

const tagSchema = new mongoose.Schema({
  name: String
});



module.exports = mongoose.model("Tag", tagSchema);
