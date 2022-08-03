const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true
    },
    password: { type: String},
    name: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      default: ""
    },
    photo: {
      type: String,
      default: "",
    },
    bio:{
      type: String,
      default: ""
    },
    privilege:{
      type: String
    },
    facebook:{
      type: String
    },
    instagram:{
      type: String
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
