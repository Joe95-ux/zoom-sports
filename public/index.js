const short = document.getElementById("short");
const long = document.getElementById("long");
const eyes = [...document.querySelectorAll(".pass-reveal")];
const seeBio = document.querySelector(".see-bio");
const profileBio = document.querySelector(".profile-biography");
const profileInput = document.getElementById("profile-pic");
const simpleBarContainer = document.getElementById("simple-bar");

// navigation bar
const navSlide = () => {
  const burger = document.querySelector(".burger");
  const sideDrawer = document.querySelector(".side-drawer");
  const closeSideDrawer = document.querySelector(".fa-times");
  const sideDrawerBackdrop = document.querySelector(".side-drawer-backdrop");
  const navLinks = document.querySelectorAll(".nav_links li");

  burger.addEventListener("click", () => {
    // animate burger
    burger.classList.toggle("toggle");
    sideDrawerBackdrop.classList.add("active-backrop");
    // toggle side-drawer
    sideDrawer.classList.add("side-drawer-active");
    closeSideDrawer.style.opacity = "1";

  });

  //close drawer
  if (closeSideDrawer !== null) {
    closeSideDrawer.addEventListener("click", () => {
      sideDrawer.classList.remove("side-drawer-active");
      sideDrawerBackdrop.classList.remove("active-backrop");
      closeSideDrawer.style.opacity = "0";
    });
  }
  if (sideDrawerBackdrop !== null) {
    sideDrawerBackdrop.addEventListener("click", () => {
      sideDrawer.classList.remove("side-drawer-active");
      sideDrawerBackdrop.classList.remove("active-backrop");
    });
  }

  // scroll EVENT
  window.addEventListener("scroll", function() {
    let navigation = document.querySelector(".navigation");
    let windowPosition = window.scrollY > 0;
    navigation.classList.toggle("scrolling-active", windowPosition);
  });

  // footer

  const currentYear = new Date().getFullYear();
  const copyrightYear = document.querySelector(".copyright");
  copyrightYear.innerHTML += currentYear;

  $(document).on("click", 'a[href^="#"]', function(event) {
    event.preventDefault();
    $("html, body").animate(
      {
        scrollTop: $($.attr(this, "href")).offset().top
      },
      500
    );
  });
};

// invoke function
navSlide();

// sticky layout
function stickLayout() {
  if (short != null || long != null) {
    let shortHeight = short.clientHeight + 497;
    let longHeight = long.clientHeight;
    if (longHeight > shortHeight) {
      short.classList.add("to-stick");
    } else {
      long.classList.add("to-stick");
    }
  }
}
stickLayout();

function previewPic() {
  if (profileInput !== null) {
    profileInput.addEventListener("input", e => {
      if (e.target.files.length > 0) {
        let src = URL.createObjectURL(e.target.files[0]);
        let avatar = document.querySelector(".profile-avatar");
        avatar.src = src;
      }
    });
  }
}
previewPic();

// show password and author bio
function revealPass() {
  if (eyes.length) {
    eyes.forEach(eye => {
      const blackeye = eye.querySelector(".black-eye");
      const openEye = eye.querySelector(".open-eye");
      const passInput = eye.previousElementSibling;
      eye.addEventListener("click", () => {
        if (passInput.type === "password") {
          passInput.type = "text";
          blackeye.style.display = "none";
          openEye.style.display = "inline-block";
        } else if (passInput.type === "text") {
          passInput.type = "password";
          blackeye.style.display = "inline-block";
          openEye.style.display = "none";
        }
      });
    });
  }
  if (seeBio) {
    seeBio.addEventListener("click", () => {
      seeBio.classList.toggle("active-see-bio");
      profileBio.classList.toggle("active-options");
    });
  }
}

revealPass();

// custom select dropdown
function dropDown() {
  const selected = [...document.querySelectorAll(".selected")];
  const optionsContainer = [...document.querySelectorAll(".options-container")];
  if (selected) {
    selected.forEach(select => {
      select.addEventListener("click", () => {
        select.previousElementSibling.classList.toggle("active-options");
      });
    });
  }

  if (optionsContainer) {
    optionsContainer.forEach(container => {
      const optionsList = container.querySelectorAll(".option");
      optionsList.forEach(option => {
        option.addEventListener("click", () => {
          const selectedInput = container.nextElementSibling.firstElementChild;
          selectedInput.value = option.querySelector("label").innerHTML;
          container.classList.remove("active-options");
        });
      });
    });
  }
}

dropDown();

function readingTime() {
  const text = document.querySelector(".post-content").innerText;
  const wpm = 180;
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  document.querySelector(".read-time h5").innerText = time + " min read";
}
readingTime();

new SimpleBar(simpleBarContainer, { autoHide: true });
