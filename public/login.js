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
  window.addEventListener("DOMContentLoaded", ()=>{
    for(let table of tables){
      if(table.dataset.name === currentLeague){
        if(table.classList.contains("active-league-table")){
          return;
        }else{
          table.classList.add("active-league-table")
        }
      }else{
        if(table.classList.contains("active-league-table")){
          table.classList.remove("active-league-table")
        }
      }
    }

  })
  leagueOptions.forEach(option => {
    option.addEventListener("click", () => {
      leagueValue = option.firstElementChild.nextElementSibling.innerText;
      for(let table of tables){
        if(table.dataset.name === leagueValue){
          if(table.classList.contains("active-league-table")){
            return;
          }else{
            table.classList.add("active-league-table")
          }
        }else{
          if(table.classList.contains("active-league-table")){
            table.classList.remove("active-league-table")
          }
        }
      }

      
    });
  });
}
