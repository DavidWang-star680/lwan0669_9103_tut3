// sketch.js
// Main file: owns the canvas and combines the mechanics.
// Iteration 1: only the Perlin noise / randomness meadow (perlin-grass.js).
// The skirt (user input) and the sky (time-based) will be added later.
//
// AI note: written with the help of Claude (Anthropic).
// "(Week N)" = the Canvas module where the course teaches that technique.

function setup() {
  createCanvas(windowWidth, windowHeight);        // createCanvas: Week 6, windowWidth: Week 8
  setupMeadow();                                  // from perlin-grass.js
}

function draw() {
  background(222, 232, 238);                      // pale sky colour. background: Week 6
  drawMeadow();                                   // from perlin-grass.js
}

// When the browser window changes size (windowResized and resizeCanvas: Week 8).
// The meadow keeps its positions as fractions of the canvas,
// so nothing else needs to be done.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// TEMPORARY TEST KEYS for iteration 1 (keyPressed and key: Week 6).
// Remove or hand over to the user-input mechanic later.
//   1 = calm wind, 2 = breeze, 3 = strong wind, R = scatter the flowers again
function keyPressed() {
  if (key === '1') setWindLevel(0);
  if (key === '2') setWindLevel(1);
  if (key === '3') setWindLevel(2);
  if (key === 'r' || key === 'R') scatterFlowers();
}
