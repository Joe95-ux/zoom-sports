const historyBtns = document.querySelectorAll(".history");
const table = document.getElementById("dashboard-table");
const dashboardInput = document.getElementById("dashboard-input");
const wcWrapper = document.querySelector(".wc-tm");
const wcMenu = document.querySelector(".wc-menu");
const tableInput = document.getElementById("change-table");
const tables = [...document.querySelectorAll(".tables")];
const leagueOptions = [...document.querySelectorAll(".league-option")];
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
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
  });
});


const ul = document.querySelector(".tags-ul"),
tagsInput = document.querySelector(".tags-ul input"),
tagNumb = document.querySelector(".tag-details span");
let submitPost = document.querySelector(".publish-btn");
let maxTags = 4,
tags = [];
let sentTags = [];
countTags();
createTag();
function countTags(){
  if(tagsInput !== null && tagNumb !==null){
    tagsInput.focus();
    tagNumb.innerText = maxTags - tags.length;
  }
}
function createTag(){
    ul.querySelectorAll("li").forEach(li => li.remove());
    tags.slice().reverse().forEach(tag =>{
        let liTag = `<li>${tag} <i class="fas fa-times" onclick="remove(this, '${tag}')"></i></li>`;
        ul.insertAdjacentHTML("afterbegin", liTag);
    });
    countTags();
}
function remove(element, tag){
    let index  = tags.indexOf(tag);
    tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
    element.parentElement.remove();
    countTags();
}
function addTag(e){

  if(e.keyCode===13){
      let tag = e.target.value.replace(/\s+/g, ' ');
      if(tag.length > 1 && !tags.includes(tag)){
          if(tags.length < 4){
              tag.split(',').forEach(tag => {
                  tags.push(tag);
                  createTag();
              });
          }
      }
      e.target.value = "";
  }
}

tagsInput.addEventListener("keyup", addTag);
const removeBtn = document.querySelector(".tag-details button");
removeBtn.addEventListener("click", () =>{
    tags.length = 0;
    ul.querySelectorAll("li").forEach(li => li.remove());
    countTags();
});

if(submitPost !== null){
  let tagString = '';
  submitPost.addEventListener('click', ()=>{
    tagString = tags.join(",");
    tagsInput.value = tagString;
    tagsInput.focus();

  })
}
