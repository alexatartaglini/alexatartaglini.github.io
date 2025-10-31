(() => {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let animationFrame = null;
  let isPaused = false;
  let mode = 'flow';

  const particleCount = 140;
  const particles = [];

  const resizeCanvas = () => {
    const { width: w, height: h } = canvas.getBoundingClientRect();
    width = canvas.width = Math.floor(w * window.devicePixelRatio);
    height = canvas.height = Math.floor(h * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.clientWidth;
      this.y = Math.random() * canvas.clientHeight;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.35 + Math.random() * 0.65;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.size = 1.5 + Math.random() * 1.5;
      this.orbitRadius = 18 + Math.random() * 40;
      this.orbitAngle = Math.random() * Math.PI * 2;
      if (!initial && mode === 'pulse') {
        this.size += 1.5;
      }
    }

    update(delta) {
      const speedMultiplier = mode === 'flow' ? 1 : mode === 'pulse' ? 0.6 : 1.2;
      this.x += this.vx * delta * speedMultiplier;
      this.y += this.vy * delta * speedMultiplier;

      if (mode === 'orbit') {
        this.orbitAngle += delta * 0.0015;
        this.x += Math.cos(this.orbitAngle) * 0.8;
        this.y += Math.sin(this.orbitAngle) * 0.8;
      }

      if (mode === 'pulse') {
        const pulse = Math.sin(performance.now() / 600 + this.orbitAngle);
        this.size = 1.8 + pulse;
      }

      if (this.x < -50 || this.x > canvas.clientWidth + 50 || this.y < -50 || this.y > canvas.clientHeight + 50) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fill();
    }
  }

  const connectParticles = () => {
    const maxDistance = mode === 'pulse' ? 140 : 120;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.hypot(dx, dy);

        if (distance < maxDistance) {
          const alpha = 1 - distance / maxDistance;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 0, 0, ${0.35 * alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  };

  const render = (time) => {
    if (isPaused) {
      animationFrame = requestAnimationFrame(render);
      return;
    }

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const delta = Math.min(16, time - (render.lastTime || time));
    render.lastTime = time;

    particles.forEach((particle) => particle.update(delta));
    connectParticles();
    particles.forEach((particle) => particle.draw());

    animationFrame = requestAnimationFrame(render);
  };

  const initParticles = () => {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
      particles.push(new Particle());
    }
  };

  const setMode = (nextMode) => {
    mode = nextMode;
    particles.forEach((particle) => particle.reset(true));
    document.querySelectorAll('[data-mode]').forEach((btn) => {
      btn.dataset.active = btn.dataset.mode === mode ? 'true' : 'false';
    });
  };

  const togglePause = (button) => {
    isPaused = !isPaused;
    button.textContent = isPaused ? 'Resume animation' : 'Pause animation';
    button.setAttribute('aria-pressed', String(isPaused));
  };

  resizeCanvas();
  initParticles();
  animationFrame = requestAnimationFrame(render);

  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(animationFrame);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    resizeCanvas();
    render.lastTime = performance.now();
    animationFrame = requestAnimationFrame(render);
  });

  resizeObserver.observe(canvas);
  window.addEventListener('resize', () => resizeCanvas());

  const playButton = document.querySelector('[data-control="play"]');
  const modeButtons = document.querySelectorAll('[data-mode]');

  if (playButton) {
    playButton.addEventListener('click', () => togglePause(playButton));
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
      isPaused = false;
      if (playButton) {
        playButton.textContent = 'Pause animation';
        playButton.setAttribute('aria-pressed', 'false');
      }
    });
  });

  // Clean-up when navigating away
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
  });
})();
