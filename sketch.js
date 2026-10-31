// sketch.js
// MAIN FILE, shared by the whole group: owns the canvas and calls each mechanic.
//   time-based-sky.js  (Fei Jiang)    sky, sun, leaves, snow  -> drawSky()
//   perlin-clouds.js   (Lizuo Wang)   noise clouds            -> called from drawSky()
//   perlin-snow.js     (Lizuo Wang)   noise snow              -> called from drawSky() in winter
//   perlin-grass.js    (Lizuo Wang)   meadow and flowers      -> setupMeadow(), drawMeadow()
//   user input-umberalla.js (Jiahui Zou) umbrella (click, mouse) -> setupUmbrella(), drawUmbrella()
//   woman-figure.js    (SHARED code)  the woman's body        -> drawWoman(), drawWomanHand()
//
// The umbrella (user input) is linked to the meadow: it pushes the grass and opens the flowers.
//
// Drawing order (back to front): sky + clouds, woman, umbrella, her hand, meadow.
// The meadow is last so the grass grows in front of her dress.
//
// There must be only ONE setup(), draw() and keyPressed() in the
// whole project, and they live in this file.
//
// AI note: written with the help of Claude (Anthropic).
// "(Week N)" = the Canvas module where the course teaches that technique.

function setup() {
  createCanvas(600, 700);                         // the group's fixed canvas size: 600 x 700 pixels (createCanvas: Week 6)
  angleMode(DEGREES);                             // Fei's clouds and sun and Jiahui's umbrella measure angles in degrees (Week 8)
  setupClouds();                                  // perlin-clouds.js
  setupSnow();                                    // perlin-snow.js
  setupMeadow();                                  // perlin-grass.js
  setupUmbrella();                                // user input-umberalla.js
}

function draw() {
  drawSky();                                      // time-based-sky.js (it also draws the noise clouds)
  drawWoman();                                    // woman-figure.js (shared)
  drawUmbrella();                                 // user input-umberalla.js, held by the woman
  drawWomanHand();                                // woman-figure.js, her hand in front of the handle
  updateGrassFromUmbrella(umbrella.angle);        // the grass leans the way the umbrella moves
  updateFlowers(umbrella.isOpen);                 // flowers come out while the umbrella is open
  drawMeadow();                                   // perlin-grass.js, in front of everything
}

// The canvas is always 600 x 700. When the browser window is smaller, index.html
// shrinks the picture to fit (CSS), so nothing needs to be done here, and p5.js
// still gives mouseX and mouseY in canvas pixels.

// TEMPORARY TEST KEYS (keyPressed and key: Week 6).
// Remove or hand over to the user-input mechanic later.
//   R = scatter the flowers, the clouds and the snow again
function keyPressed() {
  if (key === 'r' || key === 'R') {
    scatterFlowers();
    scatterClouds();
    scatterSnow();
  }
}
