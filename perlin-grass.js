// perlin-grass.js
// MECHANIC: Perlin noise and randomness  (owner: Lizuo Wang)
// Iteration 1 (version 3): a swaying meadow with scattered flowers, on its own
// (no painting image yet).
//
// AI note: this file was written with the help of Claude (Anthropic).
// Claude generated the structure and the wind logic; I read, tested and
// adjusted it.
//
// Only techniques taught in IDEA9103 are used. The tag "(Week N)" after a
// technique is the Canvas module where the course teaches it
// (Week 6 = p5.js, Week 7 = Object Oriented Programming,
//  Week 8 = Procedural Patterns / Perlin noise, Week 10 = Sound,
//  Week 11 = Easing and Animation; Weeks 2-4 = JavaScript basics).
//
// HOW IT FITS WITH sketch.js
//   sketch.js calls  setupMeadow()  once in setup()
//                    drawMeadow()   every frame in draw()
//   Other mechanics can change the wind with setWindLevel(0, 1 or 2).
//   All positions are stored as fractions (0 - 1) of the canvas, so the
//   meadow rescales by itself when the browser window changes size.

// =====================================================================
// 1. SETTINGS  (change these numbers to tune the look)
// =====================================================================
const bladeRows = 24;       // depth rows from back to front          (const: Week 2)
const bladesPerRow = 90;    // grass blades in each row
const flowersPerRow = 14;   // flowers in each row

const windScale = 3;        // size of the wind waves across the meadow (bigger = more, smaller waves)
const windSpeed = 0.012;    // how fast the wind waves travel (bigger = faster)
const maxBend = 0.8;        // how far blades can bend in radians (bigger = wilder)

// =====================================================================
// 2. VARIABLES THAT CHANGE WHILE THE SKETCH RUNS
// =====================================================================
let blades = [];                // all the GrassBlade objects (array: Week 3)
let flowers = [];               // all the Flower objects

let noiseTime = 0;              // our position in the noise; it grows, so the wind changes
let windStrength = 0.7;         // current wind, 0 = calm ... 1 = strong
let targetWindStrength = 0.7;   // the wind we are easing towards
let unit = 1;                   // size of one "painting pixel" on this canvas (set every frame)

// =====================================================================
// 3. HELPER FUNCTIONS
// =====================================================================

// Height of the top edge of the hill for a position nx (0 - 1 across the
// canvas). The result is a fraction of the canvas height. The edge is a
// gentle curve (a parabola), highest in the middle: 0.64 in the middle, 0.67 at the sides.
// So the meadow fills only the bottom third of the canvas (iteration 3).
function ridgeY(nx) {
  return 0.64 + (nx - 0.5) * (nx - 0.5) * 0.12;
}

// Pick a colour for a blade, as [red, green, blue].
// Far blades are dark blue-green, near blades are bright yellow-green,
// like the meadow in Monet's painting. A few are olive or blue-green.
function pickGrassColour(depth) {
  let r = lerp(50, 125, depth);                   // lerp: Week 11
  let g = lerp(90, 165, depth);
  let b = lerp(70, 75, depth);

  let pick = random(0, 1);
  if (pick < 0.15) {                              // if / else if: Week 4
    r = r + 45;                                   // some olive-yellow blades
    g = g - 5;
    b = b - 5;
  } else if (pick < 0.25) {
    r = r - 15;                                   // some blue-green blades
    g = g + 5;
    b = b + 40;
  }

  let shade = random(0.85, 1.15);                 // a little brighter or darker
  return [r * shade, g * shade, b * shade];
}

// How far a blade or flower is bent by the wind right now (an angle in radians).
// Blades and flowers both use this, so they sway together.
function getBend(nx, ny, noiseLocation) {
  // 1. Smooth wind wave. noise() gives a value from 0 to 1 (Week 8).
  //    Neighbouring positions give similar values, so neighbours sway together.
  //    Subtracting noiseTime makes the waves roll across the meadow.
  let wave = noise(nx * windScale + ny * 1.5 - noiseTime);

  // 2. Turn the wave into a sway with map() (Week 10, 11).
  //    noise() mostly stays between 0.2 and 0.8, so we stretch that part
  //    to -0.6 ... 1.3. There is more push to the right than to the left,
  //    like the blown scarf in the painting.
  let sway = map(wave, 0.2, 0.8, -0.6, 1.3);

  // 3. A small flutter for each blade (its own place in the noise),
  //    so no two blades move exactly the same.
  let flutter = (noise(noiseLocation + noiseTime * 2) - 0.5) * 0.6;

  return (sway + flutter) * windStrength * maxBend;
}

// =====================================================================
// 4. CLASS: ONE BLADE OF GRASS  (class and constructor: Week 7)
// =====================================================================
class GrassBlade {
  constructor(depth) {
    // depth: 0 = far away (top of meadow) ... 1 = close (bottom of meadow)
    this.nx = random(0, 1);                           // random(a, b): Week 6, 8
    this.ny = lerp(ridgeY(this.nx), 1.0, depth);      // below the hill edge

    // Close blades are taller and thicker. map(): Week 10, 11
    this.h = map(depth, 0, 1, 0.015, 0.065) * random(0.7, 1.4);   // fraction of canvas height
    this.weight = map(depth, 0, 1, 1.2, 3.5) * random(0.8, 1.2);

    this.restLean = random(-0.25, 0.25);              // small lean when there is no wind
    this.noiseLocation = random(0, 10);               // own place in the noise

    // Darker at the bottom of the blade, lighter and more yellow at the tip.
    let c = pickGrassColour(depth);
    this.baseColour = [c[0] * 0.75, c[1] * 0.8, c[2] * 0.75];
    this.tipColour = [min(255, c[0] * 1.15 + 10), min(255, c[1] * 1.2 + 14), c[2]];   // min: Week 8, 10
  }

  display() {
    // where the bottom of the blade is, in canvas pixels
    // (width and height are the canvas size: Week 6)
    let x = this.nx * width;
    let y = this.ny * height;
    let h = this.h * height;

    // angle of the tip: 0 = straight up, positive = leaning right.
    // constrain() stops it bending too far (Week 6).
    let angle = constrain(this.restLean + getBend(this.nx, this.ny, this.noiseLocation), -0.9, 0.9);

    // The blade is two short lines. The middle leans less than the tip,
    // so the blade looks curved. We use JavaScript's Math.sin() and Math.cos() (Week 5)
    // here, not p5's sin() and cos(), because the sketch uses angleMode(DEGREES).
    let midX = x + Math.sin(angle * 0.4) * h * 0.5;
    let midY = y - Math.cos(angle * 0.4) * h * 0.5;
    let tipX = x + Math.sin(angle) * h;
    let tipY = y - Math.cos(angle) * h;

    strokeWeight(this.weight * unit);                 // strokeWeight, stroke, line: Week 6
    stroke(this.baseColour[0], this.baseColour[1], this.baseColour[2]);
    line(x, y, midX, midY);
    stroke(this.tipColour[0], this.tipColour[1], this.tipColour[2]);
    line(midX, midY, tipX, tipY);
  }
}

// =====================================================================
// 5. CLASS: ONE FLOWER
// =====================================================================
// Everything is chosen once with random() in the constructor and then kept,
// so the flowers do not flicker. A new scatter = make new Flower objects.
class Flower {
  constructor(depth) {
    this.nx = random(0, 1);
    this.ny = lerp(ridgeY(this.nx), 1.0, depth);
    this.stemHeight = map(depth, 0, 1, 0.02, 0.06) * random(0.8, 1.4);
    this.size = map(depth, 0, 1, 3.0, 8.0) * random(0.8, 1.3);
    this.noiseLocation = random(0, 10);

    // Pick a colour at random: 60% yellow, 20% cream, 20% orange.
    let pick = random(0, 1);
    if (pick < 0.6) {
      this.colour = [236, 200, 60];
    } else if (pick < 0.8) {
      this.colour = [245, 236, 200];
    } else {
      this.colour = [226, 130, 60];
    }
  }

  display() {
    let x = this.nx * width;
    let y = this.ny * height;
    let h = this.stemHeight * height;

    // same wind as the grass
    let angle = getBend(this.nx, this.ny, this.noiseLocation);
    let headX = x + Math.sin(angle) * h;
    let headY = y - Math.cos(angle) * h;

    // thin green stem
    stroke(70, 100, 60);
    strokeWeight(1 * unit);
    line(x, y, headX, headY);

    // flower head. noStroke() and fill(): Week 6. ellipse(): Week 8, 10
    noStroke();
    fill(this.colour[0], this.colour[1], this.colour[2]);
    ellipse(headX, headY, this.size * unit, this.size * unit * 0.85);
  }
}

// =====================================================================
// 6. FUNCTIONS THAT sketch.js CALLS
// =====================================================================

// Make all the grass and flowers. Called once from setup().
// Objects are made row by row from far (top) to near (bottom). Drawing in
// the same order paints far things first and near things on top of them.
function setupMeadow() {
  blades = [];
  for (let r = 0; r < bladeRows; r++) {               // for loop: Week 4
    for (let i = 0; i < bladesPerRow; i++) {
      let depth = (r + random(0, 1)) / bladeRows;     // somewhere inside row r
      blades.push(new GrassBlade(depth));             // push(): Week 7, 8
    }
  }
  scatterFlowers();
}

// Throw the flowers down again in new random places.
function scatterFlowers() {
  flowers = [];
  for (let r = 0; r < bladeRows; r++) {
    for (let i = 0; i < flowersPerRow; i++) {
      let depth = (r + random(0, 1)) / bladeRows;
      flowers.push(new Flower(depth));
    }
  }
}

// Choose the wind: 0 = calm, 1 = breeze, 2 = strong.
// The meadow eases into the new wind instead of jumping.
function setWindLevel(level) {
  if (level === 0) targetWindStrength = 0.25;
  if (level === 1) targetWindStrength = 0.7;
  if (level === 2) targetWindStrength = 1.0;
}

// The dark soil / shadow under the grass: one filled shape that follows the
// top edge of the hill, so no background shows between the blades.
// beginShape(), vertex(), endShape(): Week 10
function drawGround() {
  noStroke();
  fill(38, 66, 52);
  beginShape();
  for (let i = 0; i <= 20; i++) {
    let nx = i / 20;
    vertex(nx * width, ridgeY(nx) * height);
  }
  vertex(width, height);
  vertex(0, height);
  endShape();
}

// Draw the meadow. Called every frame from draw().
function drawMeadow() {
  unit = min(width, height) / 800;      // so lines and flowers scale with the window

  // ease the wind towards its target with lerp() (Week 11)
  windStrength = lerp(windStrength, targetWindStrength, 0.05);
  // move through the noise; stronger wind moves faster
  noiseTime += windSpeed * (0.6 + windStrength);

  drawGround();

  // draw row by row: the blades of a row, then the flowers of that row
  for (let r = 0; r < bladeRows; r++) {
    for (let i = 0; i < bladesPerRow; i++) {
      blades[r * bladesPerRow + i].display();
    }
    for (let i = 0; i < flowersPerRow; i++) {
      flowers[r * flowersPerRow + i].display();
    }
  }
}
