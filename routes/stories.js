const express = require("express");
const router = express.Router();
const passport = require("passport");
const path = require("path");
const multer = require("multer");
const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");
const {
  ensureAuth,
} = require("../middleware/auth");
const {
  formatDate,
  sortCats,
  getCats,
  relatedPosts,
  recentPosts
} = require("../helpers/helpers");
const User = require("../models/User");
const Story = require("../models/Story");
const format = "MMMM Do YYYY, h:mm:ss a";
const crypto = require("crypto");
const async = require("async");
const nodemailer = require("nodemailer");

// Passport config
require("../config/passport")(passport);

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

//get edit page for story

router.get("/edit/:id", ensureAuth, async (req, res) => {
  const title = "edit post";
  try {
    const story = await Story.findOne({
      _id: req.params.id
    })
      .populate("user")
      .lean();

    if (!story) {
      return res.render("error/400");
    }

    if (story?.user?._id.equals(req.user._id) || req.user.privilege === "admin") {
      res.render("editpost", { title, story });
    } else {
      res
        .status(401)
        .json("action not authorised. you can only edit your own articles");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @desc    Update story
// @route   PUT /blog/posts/:id
router.put(
  "/post/:id",
  upload.single("photo"),
  ensureAuth,
  async (req, res) => {
    try {
      let story = await Story.findById(req.params.id).populate("user").lean();
      let newStory = req.body;
      let tags = [];
      if(req.body.tags !== ""){
        tags = [ ...req.body.tags.split(",")];
  
      }
      newStory.tags = tags;

      if (!story) {
        return res.render("error/400");
      }

      if (
        story.user?._id.equals(req.user._id) ||
        req.user.privilege === "admin"
      ) {
        if (req.file) {
          newStory.photo = req.file.location;
        }
        story = await Story.findByIdAndUpdate(
          req.params.id,
          {
            $set: newStory
          },
          { new: true }
        );

        res.redirect("/");
      } else {
        res
          .status(401)
          .json("action not authorised. You can only edit your story");
      }
    } catch (err) {
      console.error(err);
      return res.render("error/500");
    }
  }
);

// @desc    delete story
// @route   delete /blog/posts/:id
router.delete("/post/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();
    let user = await User.findById(req.user.id);

    if (!story) {
      return res.render("error/400");
    }

    if (story?.user?._id.equals(req.user.id) || req.user.privilege === "admin") {
      await Story.deleteOne({ _id: req.params.id });
      if (req.user.privilege === "admin") {
        res.redirect("/users/admin/dashboard/" + req.user._id);
      } else {
        res.redirect("/users/dashboard/" + req.user._id);
      }
    } else {
      res
        .status(401)
        .json("action not authorised. You can only delete your story");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// Get single post
router.get("/post/:slug", async (req, res) => {
  let title;
  let related;
  const userEmail = req.flash("user");
  let sortedCats;
  let recent;
  try {
    let stories = await Story.find({ status: "Public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean()
      .exec();
    let story = await Story.findOne({ slug: req.params.slug })
      .populate("user")
      .lean()
      .exec();

    if (!story || story.status == "Draft") {
      return res.render("error/400");
    } else {
      story.createdAt = formatDate(story.createdAt);
      title = story.title;
      if (stories.length) {
        stories = stories.map(story => {
          story.createdAt = formatDate(story.createdAt);
          return story;
        });
        recent = recentPosts(stories, story._id);
        related = relatedPosts(stories, story.category, story._id);
        let categories = getCats(stories);
        if (categories.length) {
          sortedCats = sortCats(categories);
        }
      }
      res.render("post", { title, userEmail, story, sortedCats, recent, related });
    }
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
