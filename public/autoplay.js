const autoplayWrap = document.querySelectorAll(".autoplay__embla");
const autoPlay = (embla, interval) => {
  const lastIndex = embla.scrollSnapList().length - 1;
  const state = { timer: 0 };

  const play = () => {
    stop();
    requestAnimationFrame(
      () => (state.timer = window.setTimeout(next, interval))
    );
  };

  const stop = () => {
    window.clearTimeout(state.timer);
    state.timer = 0;
  };

  const next = () => {
    if (embla.selectedScrollSnap() === lastIndex) {
      embla.scrollTo(0);
    } else {
      embla.scrollNext();
    }
    play();
  };

  return { play, stop };
};

const setupDotBtns = (dotsArray, embla) => {
  dotsArray.forEach((dotNode, i) => {
    dotNode.classList.add("embla__dot");
    dotNode.addEventListener("click", () => embla.scrollTo(i), false);
  });
};

const generateDotBtns = (dots, embla) => {
  const scrollSnaps = embla.scrollSnapList();
  const dotsFrag = document.createDocumentFragment();
  const dotsArray = scrollSnaps.map(() => document.createElement("button"));
  dotsArray.forEach((dotNode) => dotsFrag.appendChild(dotNode));
  dots.appendChild(dotsFrag);
  return dotsArray;
};

const selectDotBtn = (dotsArray, embla) => () => {
  const previous = embla.previousScrollSnap();
  const selected = embla.selectedScrollSnap();
  dotsArray[previous].classList.remove("is-selected");
  dotsArray[selected].classList.add("is-selected");
};

if (autoplayWrap !== null) {
  const viewPort = Array.from(document.querySelectorAll(".autoplay"));
  viewPort.forEach((view) => {
    let embla = EmblaCarousel(view, {
      loop:false
    });

    const dots = view.nextElementSibling;

    const auto = autoPlay(embla, 2000);
    const dotsArray = generateDotBtns(dots, embla);
    const setSelectedDotBtn = selectDotBtn(dotsArray, embla);

    const prevBtn = view.nextElementSibling.nextElementSibling;
    const nextBtn = view.nextElementSibling.nextElementSibling.nextElementSibling;

    const setupPrevNextBtns = (prevBtn, nextBtn, embla) => {
      prevBtn.addEventListener("click", embla.scrollPrev, false);
      nextBtn.addEventListener("click", embla.scrollNext, false);
    };

    const disablePrevNextBtns = (prevBtn, nextBtn, embla) => {
      return () => {
        if (embla.canScrollPrev()) prevBtn.removeAttribute("disabled");
        else prevBtn.setAttribute("disabled", "disabled");

        if (embla.canScrollNext()) nextBtn.removeAttribute("disabled");
        else nextBtn.setAttribute("disabled", "disabled");
      };
    };

    const disablePrevAndNextBtns = disablePrevNextBtns(prevBtn, nextBtn, embla);
    setupPrevNextBtns(prevBtn, nextBtn, embla);
    setupDotBtns(dotsArray, embla);

    embla.on("select", setSelectedDotBtn);
    embla.on("select", disablePrevAndNextBtns);
    embla.on("init", setSelectedDotBtn);
    embla.on('init', disablePrevAndNextBtns);

    view.addEventListener("mouseenter", auto.stop, false);
    view.addEventListener("touchstart", auto.stop, false);
    auto.play();
  });
}
