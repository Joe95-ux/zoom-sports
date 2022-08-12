const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const StorySchema = require("./storySchema");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    password: { type: String},
    name: {
      type: String,
      default: "",
      trim: true
    },
    role: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
      default: "",
    },
    bio:{
      type: String,
      default: "",
      trim: true
    },
    privilege:{
      type: String,
      trim: true
    },
    stories:[StorySchema],
    facebook:{
      type: String,
      trim: true
    },
    instagram:{
      type: String,
      trim: true
    },
    twitter:{
      type: String
    },
    resetPasswordToken:String,
    resetPasswordExpires: Date


  },
  { timestamps: true }
);

UserSchema.plugin(passportLocalMongoose);

module.exports = UserSchema;
