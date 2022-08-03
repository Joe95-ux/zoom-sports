const mongoose = require("mongoose");
const User = require("../models/User");
const LocalStrategy = require("passport-local");


module.exports = function(passport) {
  //passport local configurations.
  passport.use(User.createStrategy());
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};