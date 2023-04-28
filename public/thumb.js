let dim = $(window).width();
let val;
if (dim < 962) {
  val = "x";
} else {
  val = "y";
}
const thumbAutoPlay = (embla, interval) => {
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

const mainCarouselWrap = document.getElementById("main-carousel");
let mainCarouselView;
if (mainCarouselWrap !== null) {
  mainCarouselView = mainCarouselWrap.querySelector(".thumb__viewport");
}

if (mainCarouselWrap !== null) {
  let emblaApiMain = EmblaCarousel(mainCarouselView, {
    selectedClass: "",
    loop: false,
    skipSnaps: false
  });

  const autoThumb = thumbAutoPlay(emblaApiMain, 2000);

  const thumbCarouselWrap = document.getElementById("thumb-carousel");
  const thumbCarouselView = thumbCarouselWrap.querySelector(".embla__viewport");

  let emblaApiThumb = EmblaCarousel(thumbCarouselView, {
    selectedClass: "",
    containScroll: "keepSnaps",
    axis: val,
    dragFree: true
  });

  const addThumbBtnsClickHandlers = (emblaApiMain, emblaApiThumb) => {
    const slidesThumbs = emblaApiThumb.slideNodes()
  
    const scrollToIndex = slidesThumbs.map(
      (_, index) => () => emblaApiMain.scrollTo(index),
    )
  
    slidesThumbs.forEach((slideNode, index) => {
      slideNode.addEventListener('click', scrollToIndex[index], false)
    })
  
    return () => {
      slidesThumbs.forEach((slideNode, index) => {
        slideNode.removeEventListener('click', scrollToIndex[index], false)
      })
    }
  }

  const addToggleThumbBtnsActive = (emblaApiMain, emblaApiThumb) => {
    const slidesThumbs = emblaApiThumb.slideNodes()
  
    const toggleThumbBtnsState = () => {
      emblaApiThumb.scrollTo(emblaApiMain.selectedScrollSnap())
      const previous = emblaApiMain.previousScrollSnap()
      const selected = emblaApiMain.selectedScrollSnap()
      slidesThumbs[previous].classList.remove('embla-thumbs__slide--selected')
      slidesThumbs[selected].classList.add('embla-thumbs__slide--selected')
    }
  
    emblaApiMain.on('select', toggleThumbBtnsState)
    emblaApiThumb.on('init', toggleThumbBtnsState)
  
    return () => {
      const selected = emblaApiMain.selectedScrollSnap()
      slidesThumbs[selected].classList.remove('embla-thumbs__slide--selected')
    }
  }
  

  const removeThumbBtnsClickHandlers = addThumbBtnsClickHandlers(
    emblaApiMain,
    emblaApiThumb
  );
  const removeToggleThumbBtnsActive = addToggleThumbBtnsActive(
    emblaApiMain,
    emblaApiThumb
  );

  emblaApiMain
    .on("destroy", removeThumbBtnsClickHandlers)
    .on("destroy", removeToggleThumbBtnsActive);

  emblaApiThumb
    .on("destroy", removeThumbBtnsClickHandlers)
    .on("destroy", removeToggleThumbBtnsActive);

  mainCarouselView.addEventListener("mouseenter", autoThumb.stop, false);
  mainCarouselView.addEventListener("touchstart", autoThumb.stop, false);
  autoThumb.play();
}
