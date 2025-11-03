'use strict';

var tileCountX = 10;
var tileCountY = 10;
var tileWidth;
var tileHeight;

var colorStep = 6 

var endSize = 0;
var stepSize = 30;

var actRandomSeed = 0;

function setup() {
  createCanvas(600, 600);
  noStroke();
  tileWidth = width / tileCountX;
  tileHeight = height / tileCountY;
}

function draw() {
  background(175, 208, 227);

  randomSeed(actRandomSeed);

  stepSize = min(mouseX, width) / 10;
  endSize = min(mouseY, height) / 10;

  for (var gridY = 0; gridY <= tileCountY; gridY++) {
    for (var gridX = 0; gridX <= tileCountX; gridX++) {

      var posX = tileWidth * gridX;
      var posY = tileHeight * gridY;

      // modules
      var heading = int(random(4));
      for (var i = 0; i <= stepSize; i++) {
        var diameter = map(i, 0, stepSize, tileWidth, endSize);
        
        var t = i / stepSize;
        var col = lerpColor(color(175, 208, 227), color(
230, 147, 249), t);
        fill(col);
        switch (heading) {
        case 0: ellipse(posX + i, posY, diameter, diameter); break;
        case 1: ellipse(posX, posY + i, diameter, diameter); break;
        case 2: ellipse(posX - i, posY, diameter, diameter); break;
        case 3: ellipse(posX, posY - i, diameter, diameter); break;
        }
      }
    }
  }
}

function mousePressed() {
  actRandomSeed = random(100000);
}

function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png');
}
