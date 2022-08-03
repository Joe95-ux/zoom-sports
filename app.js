
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const fetch = require("node-fetch");
const compression = require("compression");
const session = require('express-session');
const mongoose = require("mongoose");
const morgan = require("morgan");
const methodOverride = require("method-override");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const MongoStore = require("connect-mongo");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const connectDB = require("./config/db");
const { subcribeHandler } = require("./utils/mailchimp");
const { ensureAuth, ensureGuest, ensureToken, ensureAdminToken, ensureAdmin } = require("./middleware/auth");
const {
  formatDate,
  dateWithTime,
  sortCats,
  getCats,
  trendingMovies,
  editorsPicks,
  latestPosts
} = require("./helpers/helpers");
const User = require("./models/User");
const Story = require("./models/Story");
const format = "MMMM Do YYYY, h:mm:ss a";

const app = express();

// Method override
app.use(methodOverride('_method'));
// Passport config
require("./config/passport")(passport);
connectDB();


// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static( __dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(cookieParser(process.env.SECRET));
app.use(session({
  secret: process.env.SECRET,
  cookie: { maxAge: 60000*60*24 },
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    mongoOptions: { useUnifiedTopology: true },
  }),
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

// Set Global variable
app.use(function(req, res, next){
  res.locals.user = req.user || null;
  res.locals.messages = req.flash();
  next();
})

app.set("view engine", "ejs");

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX
});

app.post("/", async (req, res) => {
  const subscribingUser = {
    firstName: "",
    lastName: "",
    email: req.body.subscriber
  };
  try {
    await subcribeHandler(subscribingUser);
    req.flash("user", subscribingUser.email);
    res.redirect(req.originalUrl);
  } catch (e) {
    console.log(e);
  }
});






let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}
app.listen(port, function () {
  console.log("Server has started sucessfully");
});