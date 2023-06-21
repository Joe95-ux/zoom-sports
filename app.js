require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const fetch = require("node-fetch");
const compression = require("compression");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const methodOverride = require("method-override");
const passport = require("passport");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const MongoStore = require("connect-mongo");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const connectDB = require("./config/db");
const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const { subcribeHandler } = require("./utils/mailchimp");
const { ensureAuth} = require("./middleware/auth");
const {
  formatDate,
  dateWithTime,
  sortByTag,
  otherTags,
  sortCats,
  getCats,
  getByCat,
  editorsPicks,
  latestPosts,
  paginate,
  otherCats,
  latestVideos
} = require("./helpers/helpers");
const User = require("./models/User");
const Story = require("./models/Story");
const format = "MMMM Do YYYY, h:mm:ss a";
const storyRouter = require("./routes/stories");
const userRouter = require("./routes/user");
const ckeditorRouter = require("./routes/ckeditorurl");

const app = express();

app.use(
  compression({
    level: 6,
    threshold: 5 * 1000,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    }
  })
);

// Method override
app.use(methodOverride("_method"));
// Passport config
require("./config/passport")(passport);
connectDB();

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.SECRET));
app.use(
  session({
    secret: process.env.SECRET,
    cookie: { maxAge: 60000 * 60 * 24 },
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      mongoOptions: { useUnifiedTopology: true }
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Set Global variable
app.use(function(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.messages = req.flash();
  next();
});

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
  const title = "Latest " + req.params.catName + " News, Fixtures and Results";
  const cat = req.params.catName;
  const category = encodeURI(cat);
  let sortedCats;
  let pages;
  let pageNum = 1;
  if (req.query.page >= 1) {
    pageNum = parseInt(req.query.page);
  }
  let latest;
  let currentPage;
  try {
    let allStories = await Story.find({ status: "Public" })
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
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
      stories: currentPage,
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

// sort stories by tags

app.get("/tag/:tagname", async (req, res) => {
  const title = req.params.tagname + " News";
  const tag = req.params.tagname;
  let sortedCats;
  let pages;
  let pageNum = 1;
  if (req.query.page >= 1) {
    pageNum = parseInt(req.query.page);
  }
  let latest;
  let currentPage;
  try {
    let allStories = await Story.find({ status: "Public" })
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    let stories = sortByTag(allStories, tag);
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
    latest = otherTags(allStories, tag);
    res.render("tags", {
      title,
      stories: currentPage,
      pages,
      pageNum,
      sortedCats,
      cat: tag,
      tag,
      latest
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/compose", ensureAuth, async (req, res) => {
  const title = "compose";
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }
    res.render("compose", { title, sortedCats });
  } catch (error) {
    console.log(error);
  }
});

app.post("/compose", upload.single("photo"), ensureAuth, async (req, res) => {
  let post;
  let tags = [];
  try {
    req.body.user = req.user.id;
    if (req.body.tags !== "") {
      tags = [...req.body.tags.split(",")];
    }
    post = req.body;
    post.tags = tags;
    if (req.file) {
      post.photo = req.file.location;
    }
    await Story.create(post);
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
});

app.get("/", async (req, res) => {
  const title = "Latest Football - Soccer news, match reports and fixtures";
  const active = "active-link";
  let sortedCats;
  let picks;
  let latest;
  let allStories;
  let pages;
  let pageNum = 1;
  if (req.query.page >= 1) {
    pageNum = parseInt(req.query.page);
  }
  let currentPage;
  let englishpl;
  let spanishll;
  try {
    let stories = await Story.find({ status: "Public" })
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
      if (picks.length) {
        picks = picks.slice(0, 6);
      }
      latest = getByCat(stories, "Elite one championship Cameroon");
      englishpl = getByCat(stories, "English Premier League");
      spanishll = getByCat(stories, "Spanish Laliga");
    }
    let videos = await latestVideos();
    if (videos) {
      videos = await videos.map(video => {
        video.date = formatDate(video.date);
        return video;
      });
    }
    res.render("home", {
      title,
      videos,
      stories,
      sortedCats,
      picks,
      latest,
      allStories,
      currentPage,
      pages,
      pageNum,
      englishpl,
      spanishll,
      active
    });
  } catch (err) {
    console.log(err);
  }
});

// redirect to home

app.get("/?page=1", (req, res) => {
  res.redirect("/");
});

app.get("/about-us", async (req, res) => {
  const title = "About Zoom Sportz - Football/Soccer news blog";
  const about = "active-link";
  const live = "";
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("about", { title, sortedCats, about, live });
  } catch (e) {
    console.log(e);
  }
});

app.get("/privacy", async (req, res) => {
  const title = "Privacy Policy for Zoom Sportz | Football - Soccer news";
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories =  getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("privacy", { title, sortedCats });
  } catch (e) {
    console.log(e);
  }
});

app.get("/live-preview", async (req, res) => {
  const title =
    "Livescores for English Premier League, Champions League, Bundesliga, Laliga and more";
  const live = "active-link";
  const about = "";
  const token = process.env.ODDSPEDIA_API_TOKEN;
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("livepreview", { title, sortedCats, live, about, token });
  } catch (e) {
    console.log(e);
  }
});

app.get("/highlights", async (req, res) => {
  const title = "Latest Soccer Match Highlights and Videos";
  const live = "active-link";
  const about = "";
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("highlights", { title, sortedCats, live, about });
  } catch (e) {
    console.log(e);
  }
});

app.get("/tables", async (req, res) => {
  const title = "Soccer League Tables";
  const live = "active-link";
  const about = "";
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("tables", { title, sortedCats, live, about });
  } catch (e) {
    console.log(e);
  }
});

app.get("/surebets", async (req, res) => {
  const title =
    "Surebets today | Free Arbitrage betting finder and calculator ";
  const live = "active-link";
  const about = "";
  const token = process.env.ODDSPEDIA_API_TOKEN;
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("surebets", { title, sortedCats, live, about, token });
  } catch (e) {
    console.log(e);
  }
});

app.get("/odds-comparison", async (req, res) => {
  const title = "Free Sports betting odds comparison and Live Odds";
  const live = "active-link";
  const about = "";
  const token = process.env.ODDSPEDIA_API_TOKEN;
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("odds", { title, sortedCats, live, about, token });
  } catch (e) {
    console.log(e);
  }
});

app.get("/dropping-odds", async (req, res) => {
  const title = "Dropping odds - Track betting odds movements and changes";
  const live = "active-link";
  const about = "";
  const token = process.env.ODDSPEDIA_API_TOKEN;
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("droppingodds", { title, sortedCats, live, about, token });
  } catch (e) {
    console.log(e);
  }
});

app.get("/match-center", async (req, res) => {
  const title =
    "Match Center - Football matches, stats, betting odds comparison";
  const live = "active-link";
  const about = "";
  const token = process.env.ODDSPEDIA_API_TOKEN;
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("matchCenter", { title, sortedCats, live, about, token });
  } catch (e) {
    console.log(e);
  }
});

app.get("/league", async (req, res) => {
  const title = "League matches, standings, outrights and betting odds";
  const live = "active-link";
  const about = "";
  const token = process.env.ODDSPEDIA_API_TOKEN;
  let sortedCats;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    if (stories) {
      let categories = getCats(stories);
      if (categories.length) {
        sortedCats = sortCats(categories);
      }
    }

    res.render("league", { title, sortedCats, live, about, token });
  } catch (e) {
    console.log(e);
  }
});

app.use("/stories", storyRouter);
app.use("/users", userRouter);
app.use("/editor", ckeditorRouter);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}
app.listen(port, function() {
  console.log("Server has started sucessfully");
});

app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname + "/public/404.html");
});
