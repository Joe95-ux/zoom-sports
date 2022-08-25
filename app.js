
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
const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const { subcribeHandler } = require("./utils/mailchimp");
const { ensureAuth, ensureGuest, ensureToken, ensureAdminToken, ensureAdmin } = require("./middleware/auth");
const {
  formatDate,
  dateWithTime,
  sortCats,
  getCats,
  getByCat,
  editorsPicks,
  latestPosts,
  paginate,
  otherCats
} = require("./helpers/helpers");
const User = require("./models/User");
const Story = require("./models/Story");
const format = "MMMM Do YYYY, h:mm:ss a";
const storyRouter = require("./routes/stories");
const userRouter = require("./routes/user");

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

//s3 config

const s3 = new S3Client({
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
});



//upload parameters for multer
const upload = multer({
  storage: multerS3({
    s3,
    bucket: "zoomsports-uploads",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
  })
});


app.post("/", async (req, res) => {
  const subscribingUser = {
    firstName: "",
    lastName: "",
    email: req.body.subscriber
  };
  try {
    await subcribeHandler(subscribingUser);
    req.flash("user", "Thank You For Subcribing!");
    res.redirect(req.originalUrl);
  } catch (e) {
    console.log(e);
  }
});

app.get("/category/:catName", async (req, res) => {
  const title = req.params.catName;
  const cat = req.params.catName;
  const category = encodeURI(cat);
  let sortedCats;
  let pages;
  let pageNum = 1;
  let latest;
  try {
    let allStories = await Story.find({ status: "Public" }).lean().exec();
    let stories = await Story.find({ category: cat, status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      stories = stories.map(story => {
        story.createdAt = formatDate(story.createdAt);
        return story;
      });
      const paginated = paginate(stories, 8);
      currentPage = paginated[pageNum - 1];
      pages = paginated.length;
      let categories = getCats(allStories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }
    allStories = allStories.map(story => {
      story.createdAt = formatDate(story.createdAt);
      return story;
    });
    latest = otherCats(allStories, cat);
    res.render("category", {
      title,
      stories:currentPage,
      pages,
      pageNum,
      sortedCats,
      cat,
      category,
      latest
    });
  } catch (err) {
    console.log(err);
  }
});


// next category page
app.get("/category/:catName/:num", async (req, res) => {
  const title = req.params.catName;
  const cat = req.params.catName;
  const category = encodeURI(cat);
  let sortedCats;
  let latest;
  let pages;
  let pageNum = parseInt(req.params.num);
  try {
    let allStories = await Story.find({ status: "Public" }).lean().exec();
    let stories = await Story.find({ category: cat, status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      stories = stories.map(story => {
        story.createdAt = formatDate(story.createdAt);
        return story;
      });
      const paginated = paginate(stories, 8);
      currentPage = paginated[pageNum - 1];
      pages = paginated.length;
      let categories = getCats(allStories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }
    allStories = allStories.map(story => {
      story.createdAt = formatDate(story.createdAt);
      return story;
    });
    latest = otherCats(allStories, cat);
    res.render("category", {
      title,
      stories:currentPage,
      pages,
      pageNum,
      sortedCats,
      cat,
      category,
      latest
    });
  } catch (err) {
    console.log(err);
  }
});


app.get("/compose", ensureAuth, async (req, res) => {
  const title = "compose";
  res.render("compose", { title });
});

app.post(
  "/compose",
  upload.single("photo"),
  ensureAuth,
  async (req, res) => {
    let post;
    try {
      req.body.user = req.user.id;
      post = req.body;
      if(req.file){
        post.photo = req.file.location;
      }
      await Story.create(post);
      res.redirect("/");
    } catch (err) {
      console.error(err);
    }
  }
);

app.get("/", async (req, res) => {
  const title = "blog posts";
  let sortedCats;
  let picks;
  let latest;
  let allStories;
  let pages;
  let pageNum = 1;
  let currentPage;
  let englishpl;
  let spanishll;
  try {
    let stories = await Story.find({ status: "Public"})
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      stories = stories.map(story => {
        story.createdAt = formatDate(story.createdAt);
        return story;
      });
      allStories = paginate(stories, 6);
      currentPage = allStories[pageNum - 1];
      pages = allStories.length;

      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
      picks = editorsPicks(stories);
      if(picks.length){
         picks = picks.slice(0, 6);
      }
      latest = latestPosts(stories);
      englishpl = getByCat(stories, "English Premier League");
      spanishll = getByCat(stories, "Spanish Laliga");

    }
    res.render("home", {
      title,
      stories,
      sortedCats,
      picks,
      latest,
      allStories,
      currentPage,
      pages,
      pageNum,
      englishpl,
      spanishll
    });
  } catch (err) {
    console.log(err);
  }
});

// redirect to home

app.get("/page=1", (req, res)=>{
  res.redirect("/");
})

// get next home page
app.get("/page=:num", async (req, res) => {
  const title = "blog posts";
  let sortedCats;
  let picks;
  let latest;
  let allStories;
  let pages;
  let pageNum = parseInt(req.params.num);
  let currentPage;
  let englishpl;
  let spanishll;
  try {
    let stories = await Story.find({ status: "Public"})
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      stories = stories.map(story => {
        story.createdAt = formatDate(story.createdAt);
        return story;
      });
      allStories = paginate(stories, 6);
      currentPage = allStories[pageNum - 1];
      pages = allStories.length;

      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
      picks = editorsPicks(stories);
      if(picks.length){
         picks = picks.slice(0, 6);
      }
     
      latest = latestPosts(stories);
      englishpl = getByCat(stories, "English Premier League");
      spanishll = getByCat(stories, "Spanish Laliga");

    }
    res.render("home", {
      title,
      stories,
      sortedCats,
      picks,
      latest,
      allStories,
      currentPage,
      pages,
      pageNum,
      englishpl,
      spanishll
    });
  } catch (err) {
    console.log(err);
  }
});





app.use("/stories", storyRouter);
app.use("/users", userRouter);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}
app.listen(port, function () {
  console.log("Server has started sucessfully");
});