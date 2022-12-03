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
  const mainCarousel = EmblaCarousel(mainCarouselView, {
    selectedClass: "",
    loop: false,
    skipSnaps: false
  });

  const autoThumb = thumbAutoPlay(mainCarousel, 2000);

  const thumbCarouselWrap = document.getElementById("thumb-carousel");
  const thumbCarouselView = thumbCarouselWrap.querySelector(".embla__viewport");

  const thumbCarousel = EmblaCarousel(thumbCarouselView, {
    selectedClass: "",
    containScroll: "keepSnaps",
    axis: val,
    dragFree: true
  });

  const onThumbClick = (mainCarousel, thumbCarousel, index) => () => {
    if (!thumbCarousel.clickAllowed()) return;
    mainCarousel.scrollTo(index);
  };

  const followMainCarousel = (mainCarousel, thumbCarousel) => () => {
    thumbCarousel.scrollTo(mainCarousel.selectedScrollSnap());
    selectThumbBtn(mainCarousel, thumbCarousel);
  };

  const selectThumbBtn = (mainCarousel, thumbCarousel) => {
    const previous = mainCarousel.previousScrollSnap();
    const selected = mainCarousel.selectedScrollSnap();
    thumbCarousel.slideNodes()[previous].classList.remove("is-selected");
    thumbCarousel.slideNodes()[selected].classList.add("is-selected");
  };

  thumbCarousel.slideNodes().forEach((thumbNode, index) => {
    const onClick = onThumbClick(mainCarousel, thumbCarousel, index);
    thumbNode.addEventListener("click", onClick, false);
  });

  const syncThumbCarousel = followMainCarousel(mainCarousel, thumbCarousel);
  mainCarousel.on("select", syncThumbCarousel);
  thumbCarousel.on("init", syncThumbCarousel);

  mainCarouselView.addEventListener("mouseenter", autoThumb.stop, false);
  mainCarouselView.addEventListener("touchstart", autoThumb.stop, false);
  autoThumb.play();

}
