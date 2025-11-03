// assets/js/side-animation-p5.js
(function () {
    // Where your SVGs live (put module_1.svg ... module_7.svg here)
    // e.g., assets/p5/data/module_1.svg
    const DATA_BASE = 'assets/p5/data/';
  
    const sketch = (p) => {
      let tileCount = 10;
      let tileWidth, tileHeight;
      let shapeSize = 40;
      let newShapeSize = shapeSize;
      let shapeAngle = 0;
      let maxDist;
      let currentShape;
      let shapes = [];
      let sizeMode = 0;
  
      // Make the canvas match the card
      function fitToParent() {
        const parent = p.select('#side-canvas');
        if (!parent) return;
        const rect = parent.elt.getBoundingClientRect();
        // Avoid 0x0 in initial layout
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));
        p.resizeCanvas(w, h, true);
        tileWidth = p.width / tileCount;
        tileHeight = p.height / tileCount;
        maxDist = p.sqrt(p.pow(p.width, 2) + p.pow(p.height, 2));
      }
  
      p.preload = () => {
        // Load your 7 SVG modules. Place files under assets/p5/data/
        for (let i = 1; i <= 7; i++) {
          shapes.push(p.loadImage(`${DATA_BASE}module_${i}.svg`));
        }
      };
  
      p.setup = () => {
        const parent = p.select('#side-canvas');
        // Start with something sensible; we’ll immediately resize in fitToParent.
        const c = p.createCanvas(300, 300);
        c.parent(parent);
        p.imageMode(p.CENTER);
  
        currentShape = shapes[0];
        fitToParent();
  
        // Resize with layout changes
        p.windowResized = fitToParent;
        // In case fonts/images cause late reflow, re-fit after a tick
        setTimeout(fitToParent, 0);
      };
  
      p.draw = () => {
        p.clear();
  
        for (let gridY = 0; gridY < tileCount; gridY++) {
          for (let gridX = 0; gridX < tileCount; gridX++) {
            const posX = tileWidth * gridX + tileWidth / 2;
            const posY = tileHeight * gridY + tileWidth / 2;
  
            // angle towards mouse + additional shapeAngle
            const angle = p.atan2(p.mouseY - posY, p.mouseX - posX) + (shapeAngle * (p.PI / 180));
  
            if (sizeMode === 0) newShapeSize = shapeSize;
            if (sizeMode === 1) newShapeSize = shapeSize * 1.5 - p.map(p.dist(p.mouseX, p.mouseY, posX, posY), 0, 500, 5, shapeSize);
            if (sizeMode === 2) newShapeSize = p.map(p.dist(p.mouseX, p.mouseY, posX, posY), 0, 500, 5, shapeSize);
  
            p.push();
            p.translate(posX, posY);
            p.rotate(angle);
            p.noStroke();
  
            if (currentShape && currentShape.width > 0) {
              p.image(currentShape, 0, 0, newShapeSize, newShapeSize);
            } else {
              // Fallback if SVGs aren’t found yet
              p.fill(0, 0, 0, 180);
              p.circle(0, 0, newShapeSize);
            }
            p.pop();
          }
        }
      };
  
      p.keyReleased = () => {
        const k = p.key.toLowerCase();
  
        if (k === 's') {
          // Save PNG with a simple timestamp
          p.saveCanvas(`grid-${Date.now()}`, 'png');
        } else if (k === 'd') {
          sizeMode = (sizeMode + 1) % 3;
        } else if (k === 'g') {
          tileCount += 5;
          if (tileCount > 20) tileCount = 10;
          tileWidth = p.width / tileCount;
          tileHeight = p.height / tileCount;
        } else if (k >= '1' && k <= '7') {
          const idx = Number(k) - 1;
          if (shapes[idx]) currentShape = shapes[idx];
        } else if (p.keyCode === p.UP_ARROW) {
          shapeSize += 5;
        } else if (p.keyCode === p.DOWN_ARROW) {
          shapeSize = Math.max(shapeSize - 5, 5);
        } else if (p.keyCode === p.LEFT_ARROW) {
          shapeAngle += 5;
        } else if (p.keyCode === p.RIGHT_ARROW) {
          shapeAngle -= 5;
        }
      };
    };
  
    new p5(sketch);
  })();
  