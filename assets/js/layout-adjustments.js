(() => {
  const bioCard = document.querySelector('.bio-card');
  const bioScroll = bioCard?.querySelector('.bio-scroll');
  const researchCard = document.querySelector('.content-column > .section-card:nth-of-type(1)');
  const publicationsCard = document.querySelector('.content-column > .section-card:nth-of-type(2)');

  if (!bioCard || !bioScroll || !researchCard || !publicationsCard) {
    return;
  }

  let frame = 0;

  const updateHeights = () => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }

    const targetHeight = researchCard.offsetHeight + publicationsCard.offsetHeight;
    if (!targetHeight) {
      return;
    }

    bioCard.style.setProperty('--bio-target-height', `${targetHeight}px`);

    frame = requestAnimationFrame(() => {
      const nonScrollSpace = bioCard.offsetHeight - bioScroll.offsetHeight;
      const scrollHeight = Math.max(targetHeight - nonScrollSpace, 120);
      bioScroll.style.setProperty('--bio-scroll-height', `${scrollHeight}px`);
      frame = 0;
    });
  };

  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(updateHeights);
    ro.observe(researchCard);
    ro.observe(publicationsCard);
  }

  updateHeights();
  window.addEventListener('resize', updateHeights);

  if (document.fonts && typeof document.fonts.ready?.then === 'function') {
    document.fonts.ready.then(updateHeights).catch(() => {});
  }
})();
