const historyBtns = document.querySelectorAll(".history");
const table = document.getElementById("dashboard-table");
const dashboardInput = document.getElementById("dashboard-input");
const wcWrapper = document.querySelector(".wc-tm");
const wcMenu = document.querySelector(".wc-menu");
const tableInput = document.getElementById("change-table");
const tables = [...document.querySelectorAll(".tables")];
const leagueOptions = [...document.querySelectorAll(".league-option")];
const multiSearch = document.querySelector(".multi-search-modal");
const searchTrigger = document.querySelector(".search-trigger");
const smTrigger = document.querySelector(".sm-trigger");
const multiSearchInput = document.querySelector(".multi-search");
const cancelMultiSearch = document.querySelector(".multi-search-cancel");
const multiSearchForm = document.querySelector(".multi-search-form");
let searchHeading = document.querySelector(".thum-heading");
let searchContentWrapper = document.querySelector(".search-contents");
let locationPath = window.location.pathname;
locationPath = locationPath.replace(/^\/+/g, "");
let filter, tr, td, txtValue;

// go back to previous page
if (historyBtns !== null) {
  for (let i = 0; i < historyBtns.length; i++) {
    historyBtns[i].addEventListener("click", () => {
      history.back();
    });
  }
}

function handleTextArea() {
  $(".textarea")
    .each(function() {
      this.setAttribute(
        "style",
        "height:" + this.scrollHeight + "px;overflow-y:hidden;"
      );
    })
    .on("input", function() {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
}

handleTextArea();

// dashboard table filter

function tableSearch() {
  if (table !== null) {
    tr = table.getElementsByTagName("tr");
  }

  if (dashboardInput !== null) {
    dashboardInput.addEventListener("keyup", () => {
      filter = dashboardInput.value.toUpperCase();
      for (let i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      }
    });
  }
}

tableSearch();

if (tables !== null && tableInput !== null) {
  let leagueValue = "";
  let currentLeague = tableInput.value;
  window.addEventListener("DOMContentLoaded", () => {
    for (let table of tables) {
      if (table.dataset.name === currentLeague) {
        if (table.classList.contains("active-league-table")) {
          return;
        } else {
          table.classList.add("active-league-table");
        }
      } else {
        if (table.classList.contains("active-league-table")) {
          table.classList.remove("active-league-table");
        }
      }
    }
  });

  leagueOptions.forEach(option => {
    option.addEventListener("click", () => {
      leagueValue = option.firstElementChild.nextElementSibling.innerText;
      for (let table of tables) {
        if (table.dataset.name === leagueValue) {
          if (table.classList.contains("active-league-table")) {
            return;
          } else {
            table.classList.add("active-league-table");
          }
        } else {
          if (table.classList.contains("active-league-table")) {
            table.classList.remove("active-league-table");
          }
        }
      }
    });
  });
}

$(document).ready(function() {
  $(window).keydown(function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});

const ul = document.querySelector(".tags-ul"),
  tagsInput = document.querySelector(".tags-input"),
  tagsValue = document.querySelector(".tags-value"),
  tagNumb = document.querySelector(".tag-details span");
let submitPost = document.querySelector(".publish-btn");
let alert = document.querySelector(".alert");
const submitTag = document.querySelector(".submit-tag");
let maxTags = 8,
  tags = [];
countTags();
createTag();
function countTags() {
  if (tagsInput !== null && tagNumb !== null) {
    tagsInput.focus();
    tagNumb.innerText = maxTags - tags.length;
  }
}
function createTag() {
  if (ul !== null) {
    ul.querySelectorAll("li").forEach(li => li.remove());
  }
  tags.slice().reverse().forEach(tag => {
    let liTag = `<li>${tag} <i class="fas fa-times" onclick="remove(this, '${tag}')"></i></li>`;
    ul.insertAdjacentHTML("afterbegin", liTag);
  });
  countTags();
}
function remove(element, tag) {
  let index = tags.indexOf(tag);
  tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
  element.parentElement.remove();
  countTags();
  if (tags.length < 8) {
    alert.style.display = "none";
  }
}
function addTag(e) {
  if (e.keyCode === 13) {
    let tag = e.target.value.replace(/\s+/g, " ");
    if (tag.length > 1 && !tags.includes(tag)) {
      if (tags.length < 8) {
        tag.split(",").forEach(tag => {
          if (tags.length < 8) {
            tags.push(tag);
            createTag();
          } else {
            alert.style.display = "block";
          }
        });
      } else {
        alert.style.display = "block";
      }
    }
    e.target.value = "";
  }
}

function triggerAdd() {
  let tag = tagsInput.value.replace(/\s+/g, " ");
  if (tag.length > 1 && !tags.includes(tag)) {
    if (tags.length < 8) {
      tag.split(",").forEach(tag => {
        if (tags.length < 8) {
          tags.push(tag);
          createTag();
        } else {
          alert.style.display = "block";
        }
      });
    } else {
      alert.style.display = "block";
    }
  }
  tagsInput.value = "";
}

if (tagsInput !== null) {
  tagsInput.addEventListener("keyup", addTag);
}
if (submitTag !== null) {
  submitTag.addEventListener("click", triggerAdd);
}
const removeBtn = document.querySelector(".remove-tag");
if (removeBtn !== null) {
  removeBtn.addEventListener("click", () => {
    tags.length = 0;
    ul.querySelectorAll("li").forEach(li => li.remove());
    countTags();
    if (tags.length < 8) {
      alert.style.display = "none";
    }
  });
}

if (submitPost !== null) {
  let tagString = "";
  submitPost.addEventListener("click", () => {
    tagString = tags.join(",");
    tagsValue.value = tagString;
    console.log(tagsValue);
  });
}

// trigger search modal

//multi search trigger
if (searchTrigger !== null) {
  searchTrigger.addEventListener("click", function() {
    multiSearch.classList.add("active-multi-search");
    multiSearchInput.value = "";
    multiSearchInput.focus();
  });
  if (cancelMultiSearch !== null) {
    cancelMultiSearch.addEventListener("click", function() {
      multiSearch.classList.remove("active-multi-search");
    });
  }
}

if (smTrigger !== null) {
  smTrigger.addEventListener("click", function() {
    multiSearch.classList.add("active-multi-search");
    multiSearchInput.value = "";
    multiSearchInput.focus();
  });
}

// search form
if (multiSearchForm !== null) {
  multiSearchForm.addEventListener("submit", e => {
    e.preventDefault();
  });
}

if (multiSearchInput !== null) {
  let defaultContent = document.querySelector(".default-content");
  multiSearchInput.addEventListener("keyup", e => {
    let match = e.target.value.match(/^[a-zA-Z ]*/);
    let match2 = e.target.value.match(/\s*/);
    let searchInputText = e.target.value;
    if ( e.key==='Backspace'){
      if (e.target.value !== '' ){
        e.target.value = '';
        searchInputText = "";
        searchHeading.innerHTML = 'Latest News';
        defaultContent.style.display = "flex";
        searchContentWrapper.style.display = "none";
      }
    }
    if (match2[0] === searchInputText) {
      searchContentWrapper.innerHTML = "";
      return;
    }
    if (match[0] === searchInputText) {
      searchHeading.innerHTML = `Search Results For ${searchInputText}`;
      if(searchInputText.length > 0){
        defaultContent.style.display = "none";
        searchContentWrapper.style.display = "flex";

      }
      fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: searchInputText})
      })
        .then(res => res.json())
        .then(data => {
          let payload = data.payload;
          searchContentWrapper.innerHTML = "";
          if (payload.length < 1) {
            searchContentWrapper.innerHTML = `<p>Sorry! No Results where Found for ${e.target.value}.</p>`;
            return;
          }
          payload.forEach((story, index) => {
            searchContentWrapper.innerHTML += `
            <div class="embla__slide search-item-inner thumbnail-wrap-search " style="margin-right:0 ;">
            <button class="embla__slide__inner search-inner-thumb" type="button">
                <a href="/stories/post/${story.slug}"><img class="search-photo" src="${story.photo}" /></a>
            </button>
            <div class="search-post-heading post">
                <a href="/stories/post/${story.slug}">
                   <h5>${story.category} </h5>
                   <h3>${story.title} </h3>
                </a>
            </div>
            </div>
            `;
          });
        });
        return;
    }
    searchContentWrapper.innerHTML = "";

  });
}
