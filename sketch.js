// sketch.js
// MAIN FILE: owns the canvas and calls each mechanic, in the same three-part
// structure as the group assignment (Woman with a Parasol, interactive).
// Two of the three mechanics are taken over from the assignment:
//
//   1. PERLIN NOISE AND RANDOMNESS  perlin-grass.js   the meadow and the flowers
//   2. USER INPUT                    user-input-umbrella.js  Jiahui Zou's umbrella
//                                    (the mouse swings it, a click opens / closes it).
//                                    A copy with a shorter shaft, drawn in two parts.
//   3. TIME-BASED                    time-based-sky.js  Fei Jiang's four-season sky
//                                    (sky, sun, clouds, falling leaves, snow)
//   (woman-figure.js only draws the woman. There is no little boy.)
//
// The mechanics are linked:
//   umbrella moves        -> the grass leans the same way
//   umbrella is open      -> flowers appear in the meadow (closed: they go away)
//
// This is a Ghibli-style version of the picture, based on a reference image.
// AI note: written with the help of Claude (Anthropic).
// "(Week N)" = the Canvas module where the course teaches that technique.

// The woman and the meadow are drawn in "picture units": a 1041 x 1511 picture,
// the size of the reference image. scale(k) in draw() turns picture units into
// canvas pixels. The sky (Fei's file) and the umbrella (Jiahui's file) are drawn
// in canvas pixels, so they are drawn outside of that scale().
const REF_W = 1041;                               // (const: Week 2)
const REF_H = 1511;
let k = 1;                                        // pixels per picture unit

// The umbrella file asks for this: its size on the canvas. The open umbrella is
// about 485 picture units wide (the reference picture has about 430; any bigger and the top is cut off by the canvas edge).
function umbrellaScale() {
  return k * 1.1;
}

function setup() {
  createCanvas(600, 871);                         // 600 / 1041 * 1511 = 871 (createCanvas: Week 6)
  k = width / REF_W;
  angleMode(DEGREES);                             // the sky and the umbrella files measure angles in degrees (Week 8)
  setupMeadow();                                  // perlin-grass.js
  setupUmbrella();                                // user-input-umbrella.js
}

function draw() {
  drawSky();                                      // time-based-sky.js (Fei): sky, sun, clouds, leaves, snow

  umbrella.move();                                // user-input-umbrella.js (Jiahui): follow the mouse, open / close

  // The canopy layer depends on the umbrella: OPEN, the canopy is behind the woman;
  // CLOSED, it is in front of her. openAmount goes from 1 (open) to 0 (closed),
  // so the canopy changes layer when it is half way.
  let canopyIsBehind = umbrella.openAmount >= 0.5;
  if (canopyIsBehind) {
    umbrella.display('canopy');
  }

  push();
  scale(k);                                       // scale(): Week 8
  drawWoman();                                    // woman-figure.js
  pop();

  if (!canopyIsBehind) {
    umbrella.display('canopy');
  }
  umbrella.display('pole');                       // the shaft is always IN FRONT of the woman

  push();
  scale(k);
  drawWomanHand();                                // woman-figure.js, her hand in front of the shaft
  updateGrassFromUmbrella(umbrella.angle);        // the grass leans the way the umbrella moves
  updateFlowers(umbrella.isOpen);                 // flowers come out while the umbrella is open
  drawMeadow();                                   // perlin-grass.js, in front of everything
  pop();
}

// TEST KEY (keyPressed and key: Week 6)
//   R = make a new random meadow
function keyPressed() {
  if (key === 'r' || key === 'R') {
    setupMeadow();
  }
}
