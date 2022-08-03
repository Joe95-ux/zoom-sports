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
  trendingMovies: async function (){
    const page_num = 1;
    try {
      const response = await fetch(
        "https://api.themoviedb.org/3/trending/movie/week?api_key=" +
          process.env.API_KEY +
          "&language=en-US&page=" +
          page_num +
          "&region=US"
      );
      const data = await response.json();
      const trending = await data.results;
      return trending;
    } catch (e) {
      console.log(e);
    }
  },
  relatedPosts: function (stories, cat){
    const related = stories.filter((story)=>{
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
