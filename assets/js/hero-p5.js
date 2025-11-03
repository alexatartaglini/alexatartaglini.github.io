// assets/js/hero-p5.js
(function () {
  const sketch = (p) => {
    // your original variables, scoped to this p5 instance
    let tileCountX = 10;
    let tileCountY = 10;
    let tileWidth, tileHeight;

    let endSize = 0;
    let stepSize = 30;
    let actRandomSeed = 0;

    let parentEl, W = 0, H = 0;

    let winX = 0, winY = 0;

    function sizeToParent() {
      const rect = parentEl.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      p.resizeCanvas(W, H);
      tileWidth = p.width / tileCountX;
      tileHeight = p.height / tileCountY;
    }

    p.setup = () => {
      parentEl = document.querySelector('.hero'); // was: document.getElementById('hero-p5')
      const mount = document.getElementById('hero-p5'); // keep as the DOM parent
      const c = p.createCanvas(10, 10);
      c.parent(mount);

      window.addEventListener('mousemove', (e) => {
        winX = e.clientX;
        winY = e.clientY;
      });

      // Fill the hero box
      c.elt.style.position = 'absolute';
      c.elt.style.inset = '0';
      c.elt.style.width = '100%';
      c.elt.style.height = '100%';
      c.elt.style.display = 'block';

      p.noStroke();
      sizeToParent();
    };

    p.windowResized = () => sizeToParent();

    p.draw = () => {
      p.background(175, 208, 227);
      p.randomSeed(actRandomSeed);

      // guard tiny values so we never divide by 0
      //stepSize = Math.max(1, Math.floor(Math.min(p.mouseX, p.width) / 10));
      //endSize  = Math.min(p.mouseY, p.height) / 10;

      // normalize cursor in viewport space
      const nx = Math.min(1, Math.max(0, winX / window.innerWidth));
      const ny = Math.min(1, Math.max(0, winY / window.innerHeight));

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
              p.color(175, 208, 227),
              p.color(230, 147, 249),
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

    p.mousePressed = () => { actRandomSeed = p.random(100000); };
  };

  // Mount once DOM is parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new p5(sketch));
  } else {
    new p5(sketch);
  }
})();
