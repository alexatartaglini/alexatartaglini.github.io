const sidebarCanvas = document.getElementById('sidebar-animation');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (sidebarCanvas && sidebarCanvas.getContext) {
  const ctx = sidebarCanvas.getContext('2d');
  const waves = Array.from({ length: 4 }, (_, index) => ({
    amplitude: 10 + index * 6,
    frequency: 0.8 + index * 0.25,
    phase: Math.random() * Math.PI * 2,
    speed: 0.0008 + index * 0.0003,
    color: `rgba(108, 99, 255, ${0.18 + index * 0.08})`,
  }));

  const dpr = window.devicePixelRatio || 1;
  let previousWidth = 0;
  let previousHeight = 0;
  let rafId = null;

  const resize = () => {
    const { width, height } = sidebarCanvas.getBoundingClientRect();
    sidebarCanvas.width = Math.round(width * dpr);
    sidebarCanvas.height = Math.round(height * dpr);
    previousWidth = width;
    previousHeight = height;
  };

  const ensureScale = () => {
    const { width, height } = sidebarCanvas.getBoundingClientRect();
    if (width !== previousWidth || height !== previousHeight) {
      resize();
    }
  };

  const draw = (timestamp) => {
    ensureScale();
    const { width, height } = sidebarCanvas.getBoundingClientRect();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const baseSpacing = width / 32;

    waves.forEach((wave) => {
      const phaseShift = timestamp * wave.speed;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 1) {
        const waveX = x / width;
        const y = centerY + Math.sin(waveX * Math.PI * wave.frequency + wave.phase + phaseShift) * wave.amplitude;
        const jitter = Math.sin((timestamp / 600 + x) * 0.015) * baseSpacing * 0.1;
        const drawX = x + jitter;
        if (x === 0) {
          ctx.moveTo(drawX, y);
        } else {
          ctx.lineTo(drawX, y);
        }
      }
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });

    rafId = requestAnimationFrame(draw);
  };

  const stop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const start = () => {
    if (rafId !== null) {
      return;
    }
    resize();
    rafId = requestAnimationFrame(draw);
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      stop();
    } else if (!prefersReducedMotion.matches) {
      start();
    }
  };

  const onPreferenceChange = (event) => {
    if (event.matches) {
      stop();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, sidebarCanvas.width, sidebarCanvas.height);
    } else {
      start();
    }
  };

  if (!prefersReducedMotion.matches) {
    start();
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('resize', ensureScale, { passive: true });
  prefersReducedMotion.addEventListener('change', onPreferenceChange);
}
