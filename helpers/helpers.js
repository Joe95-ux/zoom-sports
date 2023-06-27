const moment = require("moment");
const fetch = require("node-fetch");

module.exports = {
  formatDate: function(date) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString("en", options);
  },
  dateWithTime: function(date, format) {
    return moment(date).format(format);
  },
  getCats: function(stories) {
    let cats = stories.map(story => story.category);
    return cats;
  },
  sortCats: function(catArr) {
    let allCats = {};
   
    for (let cat of catArr) {
      if (!allCats[cat]) {
        allCats[cat] = 1;
      } else {
        allCats[cat]++;
      }
    }
    return allCats;
  },
  otherCats: function(stories, cat){
    let recents = stories.filter(story => story.category !== cat);
    if(recents.length){
      recents = recents.slice(0, 6);
    }
    return recents;
  },
  latestVideos: async function(){
    const url = `https://www.scorebat.com/video-api/v3/feed/?token=${process.env.SCOREBAT_API_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const videos = await data.response;
      return videos;
    } catch (error) {
      console.log(error)
    }


  },
  recentPosts: function(stories, storyId){
    storyId = storyId.toString()
    let newStories = stories.filter(story=>story._id.toString() !== storyId);
    if(newStories.length){
      newStories = newStories.slice(0,6);
    }
    return newStories;
  },
  relatedPosts: function(stories, cat, storyId) {
    storyId = storyId.toString();
    let newStories = stories.filter(story => story._id.toString() !== storyId);
    const related = newStories.filter(story => {
      return story.category === cat;
    });
    return related.slice(0,10);
  },
  latestPosts: function(stories) {
    const posts = stories.slice(0, 10);
    return posts;
  },
  getByCat: function(stories, cat){
    let sorted = stories.filter(story=>story.category === cat);
    if(sorted.length){
      sorted = sorted.slice(0, 6);
    }
    return sorted;
  },
  sortByTag: function(articles, tag){
    let stringTag = tag.split("-").join(" ");
    let stories = articles.map(story => {
      story.tags = story.tags.map(tag=>tag.toLowerCase());
      return story;
    })
    let sorted = stories.filter(story => story.tags.includes(stringTag));
    return sorted; 
  },
  otherTags: function(articles, tag){
    let stringTag = tag.split("-").join(" ");
    let stories = articles.map(story => {
      story.tags = story.tags.map(tag=>tag.toLowerCase());
      return story;
    })
    let recents = stories.filter(story => !story.tags.includes(stringTag));
    if(recents.length){
      recents = recents.slice(0, 6);
    }
    return recents;
  },
  editorsPicks: function(stories) {
    const picks = stories.reduce((pureStore, currentStory) => {
      let story = pureStore.find(
        story => story.category === currentStory.category
      );
      if (story) {
        return pureStore;
      }
      return pureStore.concat([currentStory]);
    }, []);
    return picks;
  },
  paginate: function(stories, len) {
    let newStore = [];
    let index = 0;
    while (index < stories.length) {
      newStore.push(stories.slice(index, index + len));
      index += len;
    }
    return newStore;
  }

};
