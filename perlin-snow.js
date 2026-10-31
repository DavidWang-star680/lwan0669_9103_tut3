// perlin-snow.js
// MECHANIC: Perlin noise and randomness - the winter snow  (owner: Lizuo Wang)
// Iteration 4: big snowflakes that fill the whole sky. Every flake gets its
// size, place and falling speed with random() once; noise() makes each flake
// sway left and right while it falls, so no two flakes move the same way.
//
// It replaces Fei Jiang's drawSnow() (fixed flakes in a 600 x 700 area):
// drawSky() in time-based-sky.js now calls drawNoiseSnow(alpha) in winter.
// The alpha (0 - 255) is Fei's, so the snow fades in and out with the season.
//
// AI note: this file was written with the help of Claude (Anthropic).
// Claude generated the structure; I read, tested and adjusted it.
//
// Only techniques taught in IDEA9103 are used. "(Week N)" = the Canvas module
// where the course teaches it (Week 3 = arrays, Week 4 = loops,
// Week 6 = p5.js, Week 7 = classes, Week 8 = Perlin noise and %).

// =====================================================================
// 1. SETTINGS
// =====================================================================
const snowflakeCount = 260;     // how many flakes fall at the same time

// =====================================================================
// 2. VARIABLES
// =====================================================================
let snowflakes = [];            // all the Snowflake objects (array: Week 3)

// =====================================================================
// 3. CLASS: ONE SNOWFLAKE  (class and constructor: Week 7)
// =====================================================================
class Snowflake {
  constructor() {
    this.nx = random(0, 1);                         // sideways place (fraction of width): random(): Week 6, 8
    this.startY = random(0, 1);                     // where it starts (fraction of height)

    // Most flakes are medium, about one in four is really big.
    let pick = random(0, 1);
    if (pick < 0.25) {
      this.size = random(12, 20);
    } else {
      this.size = random(5, 11);
    }

    // Big flakes are close to us, so they fall a little faster.
    this.speed = map(this.size, 5, 20, 0.0007, 0.0016) * random(0.8, 1.2);  // fraction of the height per frame; map(): Week 10, 11
    this.noiseLocation = random(0, 100);            // its own place in the noise
    this.sway = random(30, 70);                     // how far it can sway sideways, in pixels
  }

  display(alphaValue) {
    let unit = min(width, height) / 700;

    // Falling: y grows with the frame count; % starts the flake at the top again (Week 8).
    // The extra 0.1 lets the flake leave the canvas completely before it comes back.
    let fall = (this.startY + frameCount * this.speed) % 1.1;
    let y = (fall - 0.05) * height;

    // Swaying: noise() gives a smooth number from 0 to 1 (Week 8); subtract 0.5 to get -0.5 ... 0.5.
    let x = this.nx * width + (noise(this.noiseLocation + frameCount * 0.005) - 0.5) * 2 * this.sway * unit;

    noStroke();
    fill(255, 255, 255, alphaValue * 0.25);         // a soft glow round the flake
    ellipse(x, y, this.size * 1.7 * unit, this.size * 1.7 * unit);
    fill(255, 255, 255, alphaValue * 0.9);          // the flake
    ellipse(x, y, this.size * unit, this.size * unit);
  }
}

// =====================================================================
// 4. FUNCTIONS THAT THE REST OF THE PROJECT CALLS
// =====================================================================

// Make all the flakes. Called once from setup() (and again by scatterSnow()).
function setupSnow() {
  snowflakes = [];
  for (let i = 0; i < snowflakeCount; i++) {        // for loop: Week 4
    snowflakes.push(new Snowflake());               // push(): Week 7, 8
  }
}

// Throw the flakes down again in new random places.
function scatterSnow() {
  setupSnow();
}

// Draw the snow. alphaValue = 0 (no snow) ... 255 (full snow).
function drawNoiseSnow(alphaValue) {
  for (let i = 0; i < snowflakes.length; i++) {
    snowflakes[i].display(alphaValue);
  }
}
