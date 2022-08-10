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
  relatedPosts: function (stories, cat, storyId){
    storyId = storyId.toString()
    let newStories = stories.filter(story=>story._id.toString() !== storyId);
    const related = newStories.filter((story)=>{
      return story.category === cat;
    })
    return related;

  },
  latestPosts: function (stories){
    const posts =  stories.slice(0, 8);
    return posts;
  },
  editorsPicks: function(stories){
    const picks = stories.reduce((pureStore, currentStory)=>{
      let story = pureStore.find(story => story.category === currentStory.category);
      if(story){
        return pureStore;
      }
      return pureStore.concat([currentStory]);

    }, [])
    return picks;
  },
  paginate: function(stories, len){
    let newStore = [];
    let index = 0;
    while(index < stories.length){
      newStore.push(stories.slice(index, index + len));
      index += len;
    }
    return newStore;
  }

};
