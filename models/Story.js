const mongoose = require("mongoose");
const slugify = require('slugify');

const StorySchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  photo: {
    type: String,
  },
  description: {
    type: String,
  },
  keywords: {
    type: String,
  },
  photoTitle: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: "Public",
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

StorySchema.pre('validate', function(next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
  next()
})

module.exports = mongoose.model("Story", StorySchema);
