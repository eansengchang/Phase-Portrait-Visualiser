// create a parser
const parser = math.parser();

let SIZE;
const FRAMERATE = 60;

let yMin, yMax, xMin, xMax;
let f, g;

let particles = [];

let backgroundImage;
let button;

let isError = false;

// convert window pixel coordinates to mathematical coordinates
// functional inverse of coord2win
function win2coord(coord) {
  coord[0] = map(coord[0], 0, SIZE, xMin, xMax);
  coord[1] = map(coord[1], 0, SIZE, yMax, yMin);
  return coord;
}

// convert math coordinates to window coordinates
// inverse of win2coord
function coord2win(coord) {
  coord[0] = map(coord[0], xMin, xMax, 0, SIZE);
  coord[1] = map(coord[1], yMax, yMin, 0, SIZE);
  return coord;
}

function setup() {
  SIZE = windowHeight;
  let cnv = createCanvas(SIZE, SIZE);
  cnv.style('display', 'block');
  cnv.parent('CanvasWrapper');
  updateCanvas();

  let htmlButton = document.getElementById('updateButton');
  button = new p5.Element(htmlButton);
  button.mouseClicked(updateCanvas);
}

function draw() {
  // console.log(frameRate());
  if (isError) return;

  background(backgroundImage);

  makeParticles();

  showParticles();
  updateParticles();

  displayCoordsTopLeft();
}

function updateCanvas() {
  //clear particles
  particles = [];
  console.log('clearing canvas...');
  background(0);

  //get paramters from text
  try {
    parser.evaluate('f(x,y) = ' + document.getElementById('xDot').value);
    f = parser.get('f');
    parser.evaluate('g(x,y) = ' + document.getElementById('yDot').value);
    g = parser.get('g');

    yMin = parseInt(document.getElementById('yMin').value);
    yMax = parseInt(document.getElementById('yMax').value);
    xMin = parseInt(document.getElementById('xMin').value);
    xMax = parseInt(document.getElementById('xMax').value);

    //draw field arrows and axis and set that as the backgruond
    drawAxis();
    drawField();
    backgroundImage = get();

    document.getElementById('errorText').innerHTML = '';
    isError = false;
  } catch (error) {
    background(0);

    isError = true;
    console.log(error);
    document.getElementById('errorText').innerHTML = error;
  }
}

function drawField() {
  colorMode(HSB);
  //loop through canvas and draw arrows everywhere
  for (let i = 0; i < SIZE; i += 40) {
    for (let j = 0; j < SIZE; j += 40) {
      //get dx and dy as a vector
      let coord = win2coord([i, j]);
      let dx = f(coord[0], coord[1]);
      let dy = -g(coord[0], coord[1]);
      let vector = createVector(dx, dy);

      //map size of arrow and length to magnitude
      let r = map(vector.magSq(), 0, 16, 3, 4, true);
      let l = map(vector.magSq(), 0, 16, 4, 2, true);

      //set hue depending on vector magnitude
      let hue = map(vector.magSq(), 0, 16, 260, 0, true);
      stroke(hue, 255, 100);
      fill(hue, 255, 100);

      //get vector to same size
      vector.normalize();
      vector.mult(25);

      //draw the vector arrow

      let angle = vector.heading() + PI / 2;
      push();
      translate(i + vector.x / l, j + vector.y / l);
      rotate(angle);
      noStroke();
      beginShape();
      vertex(0, -r * 2);
      vertex(-r, r * 2);
      vertex(r, r * 2);
      endShape(CLOSE);
      pop();

      //draw the vector line
      strokeWeight(2);
      line(
        i - vector.x / l,
        j - vector.y / l,
        i + vector.x / l,
        j + vector.y / l
      );
    }
  }
}

function drawAxis() {
  colorMode(RGB);
  stroke(255);
  let origin = coord2win([0, 0]);
  let minPoint = coord2win([xMin, yMin]);
  let maxPoint = coord2win([xMax, yMax]);
  //y axis
  line(origin[0], minPoint[1], origin[0], maxPoint[1]);
  //x axis
  line(minPoint[0], origin[1], maxPoint[0], origin[1]);
}

function makeParticles() {
  if (frameCount % 4 == 0) {
    let coord = win2coord([random([0, width]), random(height)]);
    particles.push(new Particle(createVector(coord[0], coord[1])));
    coord = win2coord([random(width), random([0, height])]);
    particles.push(new Particle(createVector(coord[0], coord[1])));
  }
  let coord = win2coord([random(width), random(height)]);
  particles.push(new Particle(createVector(coord[0], coord[1])));
  coord = win2coord([random(width), random(height)]);
  particles.push(new Particle(createVector(coord[0], coord[1])));
  coord = win2coord([
    randomGaussian(width / 4, width / 4),
    randomGaussian(height / 4, height / 4),
  ]);
  particles.push(new Particle(createVector(coord[0], coord[1])));
}

function updateParticles() {
  //move each particle depending on vector field
  for (const particle of particles) {
    let dx = f(particle.pos.x, particle.pos.y);
    let dy = g(particle.pos.x, particle.pos.y);
    particle.move(createVector(dx, dy));
  }
}

function showParticles() {
  for (const particle of particles) {
    particle.show();
  }
}

function displayCoordsTopLeft() {
  //display the coordinates of the mouse
  let coord = win2coord([mouseX, mouseY]);
  let string = `${round(coord[0], 2)}, ${round(coord[1], 2)}`;
  noStroke();
  fill(50);
  rect(5, 5, textWidth(string) + 10, textSize() + 10);
  fill(255);
  textSize(20);
  textAlign(LEFT, CENTER);
  text(string, 10, 20);
}
