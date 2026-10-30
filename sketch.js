// sketch.js
// MAIN FILE, shared by the whole group: owns the canvas and calls each mechanic.
//   time-based-sky.js  (Fei Jiang)    sky, sun, leaves, snow  -> drawSky()
//   perlin-clouds.js   (Lizuo Wang)   noise clouds            -> called from drawSky()
//   perlin-grass.js    (Lizuo Wang)   meadow and flowers      -> setupMeadow(), drawMeadow()
// The user-input umbrella (user input-umberalla.js) is not joined yet: it still has
// its own setup() and draw(), which must be renamed (e.g. setupUmbrella / drawUmbrella)
// before it can be added here.
//
// There must be only ONE setup(), draw(), windowResized() and keyPressed() in the
// whole project, and they live in this file.
//
// AI note: written with the help of Claude (Anthropic).
// "(Week N)" = the Canvas module where the course teaches that technique.

function setup() {
  createCanvas(windowWidth, windowHeight);        // createCanvas: Week 6, windowWidth: Week 8
  angleMode(DEGREES);                             // Fei's clouds, sun and the umbrella measure angles in degrees (Week 8)
  setupClouds();                                  // perlin-clouds.js
  setupMeadow();                                  // perlin-grass.js
}

function draw() {
  drawSky();                                      // time-based-sky.js (it also draws the noise clouds)
  drawMeadow();                                   // perlin-grass.js, in front of the sky
}

// When the browser window changes size (windowResized and resizeCanvas: Week 8).
// The clouds and the meadow keep their positions as fractions of the canvas,
// so nothing else needs to be done.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// TEMPORARY TEST KEYS (keyPressed and key: Week 6).
// Remove or hand over to the user-input mechanic later.
//   1 = calm wind, 2 = breeze, 3 = strong wind
//   R = scatter the flowers and the clouds again
function keyPressed() {
  if (key === '1') setWindLevel(0);
  if (key === '2') setWindLevel(1);
  if (key === '3') setWindLevel(2);
  if (key === 'r' || key === 'R') {
    scatterFlowers();
    scatterClouds();
  }
}
