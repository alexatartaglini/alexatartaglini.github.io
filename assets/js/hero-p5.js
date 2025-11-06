// assets/js/hero-p5.js
(function () {
  const sketch = (p) => {
    const MAX_BLUR_PX = 24;      // peak blur when cursor is at extreme left
    const BLUR_MODE = 'exp';   // 'cubic' or 'exp' (try both!)
    const EXP_K = 3;             // steeper falloff for 'exp' mode

    let canvasEl;                // we'll keep a handle to the <canvas> DOM node

    const PALETTES = [
      ['#AFD0E3', '#E693F9'], // blue / pink
      ['#D9D7D7', '#FFE56B'], // light gray / yellow
      ['#C3F097', '#65DBA3'], // green / blue
      ['#FFFFFF', '#D1D1D1'], // white / orange
      ['#DFC9FF', '#FF6363'], // purple / red
    ];
    
    // current colors used in draw()
    let BG_HEX = PALETTES[0][0];
    let SEC_HEX = PALETTES[0][1];
    let currentPaletteIdx = 0;
    
    // pick a palette by index
    function setPalette(idx) {
      currentPaletteIdx = idx;
      BG_HEX = PALETTES[idx][0];
      SEC_HEX = PALETTES[idx][1];
    }
    
    // pick a random index that's not the current one
    function randomPaletteIndexExcept(curr) {
      if (PALETTES.length === 1) return 0;
      let idx;
      do { idx = Math.floor(Math.random() * PALETTES.length); } while (idx === curr);
      return idx;
    }

    let tileCountX = 10;
    let tileCountY = 10;
    let tileWidth, tileHeight;

    let endSize = 0;
    let stepSize = 30;
    let actRandomSeed = 0;

    let parentEl, W = 0, H = 0;
    let winX = 0, winY = 0;

    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const mqNarrow = window.matchMedia('(max-width: 860px)');
    let isMobile = mqCoarse.matches || mqNarrow.matches;

    [mqCoarse, mqNarrow].forEach(mq => {
      mq.addEventListener?.('change', () => {
        isMobile = mqCoarse.matches || mqNarrow.matches;
      });
    });

    // shared progress override (0..1) that draw() will read
    let nxFromScroll = null;

    function getHeroProgress(el) {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const rect = el.getBoundingClientRect();
      const total = rect.height + vh;          // distance hero travels across the viewport
      const traveled = vh - rect.top;          // how far since it started entering
      return Math.min(1, Math.max(0, traveled / total));
    }

    function clamp(v, a = 0, b = 1) { return Math.min(b, Math.max(a, v)); }

    function sizeToParent() {
      const rect = parentEl.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      p.resizeCanvas(W, H);
      tileWidth = p.width / tileCountX;
      tileHeight = p.height / tileCountY;
    }

    let scrollBindingsAttached = false;
    
    function inViewport(el) {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const r = el.getBoundingClientRect();
      // "any part visible" criterion
      return r.bottom > 0 && r.top < vh;
    }

    function onScrollOrResize() {
      if (!parentEl) return;

      // compute progress across viewport path
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const rect = parentEl.getBoundingClientRect();
      const total = rect.height + vh;
      const traveled = vh - rect.top;
      const pVal = Math.min(1, Math.max(0, traveled / total));

      // keep a copy so draw() can read it
      nxFromScroll = pVal;

      // keep vertical neutral (or tie to pVal if you want)
      winY = (window.innerHeight || 1) * 0.5;

      // update blur immediately so it responds during scroll
      const blurPx = MAX_BLUR_PX * Math.exp(-EXP_K * pVal);
      if (canvasEl && inViewport(parentEl) && (isMobile)) {
        canvasEl.style.filter = `blur(${blurPx.toFixed(2)}px)`;
      }
    }

    function attachScrollBindings() {
      if (scrollBindingsAttached || !parentEl) return;
      window.addEventListener('scroll', onScrollOrResize, { passive: true });
      window.addEventListener('resize', onScrollOrResize, { passive: true });
      scrollBindingsAttached = true;
      // run once so initial state is correct (e.g., hero mid-viewport)
      onScrollOrResize();
    }

    p.setup = () => {
      parentEl = document.querySelector('.hero'); 
      const mount = document.getElementById('hero-p5');
      const c = p.createCanvas(10, 10);
      c.parent(mount);
      canvasEl = c.elt;
      canvasEl.style.position = 'absolute';
      canvasEl.style.inset = '0';
      canvasEl.style.width = '100%';
      canvasEl.style.height = '100%';
      canvasEl.style.display = 'block';
      canvasEl.style.transition = 'filter 120ms ease-out';

      setPalette(0); // default on load
      attachScrollBindings();

      // Keep your mouse tracking for desktop
      function mouseMove(e) { winX = e.clientX; winY = e.clientY; }
      window.addEventListener('mousemove', mouseMove);

      function isMobileLike() {
        return (
          window.matchMedia?.('(hover: none)').matches ||
          window.matchMedia?.('(pointer: coarse)').matches ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth <= 860
        );
      }

      isMobile = isMobileLike();

      /*
      // If media queries change, recompute isMobile and nudge the bindings/blur once.
      [mqCoarse, mqNarrow].forEach((mq) => {
        mq.addEventListener?.('change', () => {
          isMobile = isMobileLike();
          onScrollOrResize(); // ensure immediate update when mode flips
        });
      });
      */

      p.noStroke();
      sizeToParent();

      const seedButton = document.querySelector('.seed-button');
      if (seedButton) {
        seedButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          actRandomSeed = p.random(100000);
          const nextIdx = randomPaletteIndexExcept(currentPaletteIdx);
          setPalette(nextIdx);

          seedButton.setAttribute('data-active', 'true'); // flash active
          seedButton.blur();                               // clear sticky :focus-visible
          setTimeout(() => {
            seedButton.removeAttribute('data-active');
            seedButton.setAttribute('data-active', 'false');
          }, 220); // brief flash before returning to normal
        });
      }

      /*
      if (isMobile && parentEl) {
        // initialize progress and center the "mouse"
        const prog = getHeroProgress(parentEl);
        nxFromScroll = prog;
      
        // update on scroll/resize; passive for perf
        const onScrollOrResize = () => {
          if (!parentEl) return;
          const pVal = getHeroProgress(parentEl);
          nxFromScroll = pVal;
      
          // keep vertical influence stable (feel free to tie it to pVal)
          winY = (window.innerHeight || 1) * 0.5;
      
          // update blur immediately so it responds during scroll even if rAF is throttled
          const MAX_BLUR_PX = 24;
          const EXP_K = 3;
          const blurPx = MAX_BLUR_PX * Math.exp(-EXP_K * pVal);
          if (canvasEl) canvasEl.style.filter = `blur(${blurPx.toFixed(2)}px)`;
        };
      
        // listen on window (covers iOS Safari)
        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize, { passive: true });
      
        // run once in case the hero starts mid-viewport
        onScrollOrResize();
      }

      function mouseMove(e) {
        winX = e.clientX;
        winY = e.clientY;
      }
      window.addEventListener('mousemove', mouseMove);

      for (const mq of [mqCoarse, mqNarrow]) {
        mq.addEventListener?.('change', () => {
          if (mq.matches) {
            winX = (window.innerWidth || 1) * 0.5;
            winY = (window.innerHeight || 1) * 0.5;
          }
        });
      }

      // Fill the hero box
      c.elt.style.position = 'absolute';
      c.elt.style.inset = '0';
      c.elt.style.width = '100%';
      c.elt.style.height = '100%';
      c.elt.style.display = 'block';

      p.noStroke();
      sizeToParent();

      const seedButton = document.querySelector('.seed-button');
      if (seedButton) {
        seedButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();           // make sure no other click handlers fire
          actRandomSeed = p.random(100000);
          const nextIdx = randomPaletteIndexExcept(currentPaletteIdx);
          setPalette(nextIdx);
        });
      }
        */
    };

    p.windowResized = () => sizeToParent();

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const HEADER_OFFSET = document.querySelector('header')?.offsetHeight || 0;

    /**
     * Progress tied ONLY to the hero's height:
     *  - 0 when hero's top is at viewport top (rect.top === 0)
     *  - 1 when hero's bottom reaches viewport top (rect.top === -heroH)
     * Assumes hero starts at page top. Works even if not — it clamps to [0,1].
     * If you have a sticky header, pass its height as topOffset.
     */
    /**
     * Progress tied ONLY to the hero's height.
     * Returns a value between start and end (default 0 → 1).
     * Example: heroSelfProgress(heroEl, 0, 0.25, 0.75) // → 0.25–0.75 range
     */
    function heroSelfProgress(heroEl, topOffset = 0, start = 0.25, end = 0.75) {
      const rect = heroEl.getBoundingClientRect();
      const heroH = rect.height;

      // How far the hero's top has moved past the (offset) top of viewport
      const traveled = Math.min(Math.max(topOffset - rect.top, 0), heroH); // clamp 0..heroH
      const raw = traveled / heroH; // 0..1

      // Remap 0..1 to [start, end]
      return start + (end - start) * raw;
    }
    /** Optional: Is any part of hero on screen? */
    function heroInView(heroEl) {
      const r = heroEl.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }

    p.draw = () => {
      p.background(BG_HEX);
      p.randomSeed(actRandomSeed);

      let nx = clamp01(winX / window.innerWidth);
      let ny = clamp01(winY / window.innerHeight);

      if (parentEl && isMobile && inViewport(parentEl)) {
        // Prefer scroll-derived progress on mobile while visible
        const progress = heroSelfProgress(parentEl, HEADER_OFFSET); // 0..1 over exactly hero height
        nx = progress; // full span on mobile
        ny = progress;
      }

      /*
      if (isMobile && parentEl) {
        // prefer scroll-derived progress when available
        const inView = (() => {
          const vh = window.innerHeight || document.documentElement.clientHeight;
          const r = parentEl.getBoundingClientRect();
          return r.bottom > 0 && r.top < vh;
        })();
      
        if (inView) {
          const progress = (nxFromScroll != null) ? nxFromScroll : getHeroProgress(parentEl);
          nx = progress;  // horizontal surrogate driven by vertical scroll
          ny = 0.5;       // or tie to progress if you want: ny = 0.5 + 0.4*(progress - 0.5)
        }
      }
      */

      let blurPx;
      if (BLUR_MODE === 'cubic') {
        // strong near-left blur, drops off steeply to the right
        blurPx = MAX_BLUR_PX * Math.pow(1 - nx, 3);
      } else {
        // exponential falloff (even steeper feel)
        blurPx = MAX_BLUR_PX * Math.exp(-EXP_K * nx);
      }
      // apply to the canvas element
      canvasEl.style.filter = `blur(${blurPx.toFixed(2)}px)`;

      // map to canvas scale so moving anywhere in the window drives the full range
      stepSize = Math.max(1, Math.floor((nx * p.width) / 10));
      endSize  = (ny * p.height) / 10;

      for (let gridY = 0; gridY <= tileCountY; gridY++) {
        for (let gridX = 0; gridX <= tileCountX; gridX++) {
          const posX = tileWidth * gridX;
          const posY = tileHeight * gridY;

          const heading = p.int(p.random(4));
          for (let i = 0; i <= stepSize; i++) {
            const diameter = p.map(i, 0, stepSize, tileWidth, endSize);
            const t = i / stepSize;

            const col = p.lerpColor(
              p.color(BG_HEX),
              p.color(SEC_HEX),
              t
            );
            p.fill(col);

            switch (heading) {
              case 0: p.ellipse(posX + i, posY, diameter, diameter); break;
              case 1: p.ellipse(posX, posY + i, diameter, diameter); break;
              case 2: p.ellipse(posX - i, posY, diameter, diameter); break;
              case 3: p.ellipse(posX, posY - i, diameter, diameter); break;
            }
          }
        }
      }
    };

    //p.mousePressed = () => { actRandomSeed = p.random(100000); };
  };

  // Mount once DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new p5(sketch));
  } else {
    new p5(sketch);
  }
})();
