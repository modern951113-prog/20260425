let shapes = [];
let song;
let amplitude;
let points = [[-3, 5], [5, 6], [8, 0], [4, -5], [-4, -4]];

function preload() {
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  amplitude = new p5.Amplitude();

  for (let i = 0; i < 10; i++) {
    let shapePoints = points.map(pt => {
      return [pt[0] * random(10, 30), pt[1] * random(10, 30)];
    });

    let shape = {
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      points: shapePoints
    };
    shapes.push(shape);
  }
}

function draw() {
  background('#ffcdb2');
  strokeWeight(2);

  let level = amplitude.getLevel();
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  if (!song.isPlaying()) {
    fill(0);
    textAlign(CENTER, CENTER);
    text('Click to play', width / 2, height / 2);
  }

  for (let shape of shapes) {
    shape.x += shape.dx;
    shape.y += shape.dy;

    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    fill(shape.color);
    stroke(shape.color);

    push();
    translate(shape.x, shape.y);
    scale(sizeFactor);

    beginShape();
    for (let pt of shape.points) {
      vertex(pt[0], pt[1]);
    }
    endShape(CLOSE);
    pop();
  }
}

function mousePressed() {
  userStartAudio();
  if (song.isLoaded() && !song.isPlaying()) {
    song.loop();
  }
}
