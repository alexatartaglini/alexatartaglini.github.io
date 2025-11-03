(() => {
  
  const canvas = document.getElementById('side-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function fit() {
    // Fill the card; respects the CSS height set on the canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
  }

  window.addEventListener('resize', fit, { passive: true });
  fit();

  let t = 0;
  function loop() {
    t += 0.01;
    const { width: w, height: h } = canvas;

    // soft background
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, w, h);

    // simple flowing dots
    const N = 40;
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * w;
      const y = h * 0.5 + Math.sin(t * 0.8 + i * 0.35) * (h * 0.25);
      ctx.beginPath();
      ctx.arc(x, y, 3 + 2 * Math.sin(t + i), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // adjust to taste / theme vars if desired
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
