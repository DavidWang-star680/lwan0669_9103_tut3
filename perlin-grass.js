// perlin-grass.js
// PERLIN NOISE AND RANDOMNESS mechanic (part 2): the meadow and the flowers.
//
// * Big flat grass blades, drawn row by row from the far hill to the front.
//   Every blade gets random numbers (size, lean, colour) that are stored in its
//   constructor, so they do not change from frame to frame.
// * Perlin noise makes the wind: a smooth wave rolls over the meadow, so
//   neighbouring blades sway together. noise() also makes soft patches of the
//   meadow greener or more yellow.
// * The meadow is LINKED to the umbrella (user-input-umbrella.js):
//     - when the umbrella moves, the grass leans the same way (umbrellaPush)
//     - while the umbrella is open, buttercups grow in the meadow (flowerBloom)
//
// Techniques ("(Week N)" = the Canvas module where it is taught):
//   noise(), random()                                          (Week 8)
//   class, constructor, this, methods                          (Week 7)
//   arrays, array.push(), arrays of arrays                     (Week 3, 8)
//   for loops, if / else if                                    (Week 4)
//   beginShape(), vertex(), endShape(), fill(), noStroke()     (Week 6)
//   map(), lerp(), constrain()                                 (Week 6, 10, 11)
//   functions with parameters that return a value              (Week 4)
//   AI note: written with the help of Claude (Anthropic).

// =====================================================================
// 1. SETTINGS  (change these numbers to tune the look)
// =====================================================================
const rowCount = 15;            // rows of grass, from the far hill to the front
const flowersPerRow = 5;        // buttercups in each row

const windScale = 3;            // size of the wind waves across the meadow
const windSpeed = 0.005;        // how fast the wind waves travel (small = a slow, calm breeze)
const windStrength = 0.2;       // a gentle breeze (0 = calm ... 1 = strong)
const maxBend = 0.8;            // how far a blade can bend, in radians
const umbrellaPushBend = 0.5;   // how far the moving umbrella pushes the grass, in radians
const bloomSpeed = 0.004;       // how fast the flowers appear, per frame (0.004 = about 4 seconds)

// =====================================================================
// 2. VARIABLES THAT CHANGE WHILE THE SKETCH RUNS
// =====================================================================
let meadowRows = [];            // an array of rows; every row is an array of blades and flowers
let noiseTime = 0;              // our position in the noise; it grows, so the wind moves

let umbrellaPush = 0;           // -1 = umbrella moving left ... 0 = still ... 1 = moving right
let lastUmbrellaAngle = 0;      // the umbrella's angle in the last frame
let flowerBloom = 0;            // 0 = no flowers yet ... 1 = all flowers are out

// =====================================================================
// 3. HELPER FUNCTIONS
// =====================================================================

// The top edge of the hill: y (in picture units) for a position nx from 0 to 1.
function ridgeY(nx) {
  // 0.645 at both sides, about 0.75 near the woman's feet (sin() works in degrees here)
  return (0.645 + 0.105 * sin(180 * nx) * sin(180 * nx)) * REF_H;
}

// A colour for one blade, as [red, green, blue]. Blades are dark teal, green,
// yellow-green or light green. noise() makes patches that are greener or yellower,
// random() makes each blade a little different.
function pickGrassColour(nx, depth) {
  let pick = random(0, 1);
  let c;
  if (pick < 0.32) {
    c = [50, 108, 88];                  // dark teal green
  } else if (pick < 0.62) {
    c = [92, 150, 78];                  // fresh green
  } else if (pick < 0.82) {
    c = [150, 178, 78];                 // yellow-green
  } else {
    c = [126, 176, 98];                 // light green
  }

  let patch = noise(nx * 4, depth * 6 + 50);              // a smooth patch of colour
  let yellowness = constrain(map(patch, 0.25, 0.75, -1, 1), -1, 1);
  c = [c[0] + yellowness * 20, c[1] + yellowness * 6, c[2] - yellowness * 14];

  let shade = random(0.88, 1.12);                         // a little brighter or darker
  return [c[0] * shade, c[1] * shade, c[2] * shade];
}

// How far a blade or flower is bent by the wind right now, as an angle in radians.
function getBend(nx, ny, noiseLocation) {
  // 1. A smooth wave. Neighbouring places give similar values, so neighbours sway
  //    together. Subtracting noiseTime makes the waves roll across the meadow.
  let wave = noise(nx * windScale + ny * 1.5 - noiseTime);
  // 2. map() stretches the part of the noise that is mostly used (0.2 - 0.8) to a
  //    sway: a bit more push to the right than to the left, like a breeze.
  let sway = map(wave, 0.2, 0.8, -0.6, 1.3);
  // 3. A small flutter for each blade (its own place in the noise).
  let flutter = (noise(noiseLocation + noiseTime * 1.5) - 0.5) * 0.6;
  // 4. When the umbrella moves it pushes the grass the same way. When the umbrella
  //    is still, umbrellaPush is 0 and only the noise wind is left.
  return (sway + flutter) * windStrength * maxBend + umbrellaPush * umbrellaPushBend;
}

// =====================================================================
// 4. CLASS: ONE BLADE OF GRASS  (class and constructor: Week 7)
// =====================================================================
// A blade is a curved leaf shape with two tones: a darker left half and a
// lighter right half, like the flat painted grass of the reference picture.
class GrassBlade {
  constructor(nx, baseY, h, w, colour, lean) {
    this.nx = nx;                                   // across the picture, 0 - 1
    this.baseY = baseY;                             // where the blade starts, in picture units
    this.h = h;                                     // height
    this.w = w;                                     // width at its widest
    this.dark = colour;
    this.light = [constrain(colour[0] * 1.12 + 8, 0, 255), constrain(colour[1] * 1.1 + 10, 0, 255), constrain(colour[2] * 1.04, 0, 255)];
    this.restLean = lean;                           // small lean when there is no wind
    this.noiseLocation = random(0, 10);             // own place in the noise
    this.ny = baseY / REF_H;
  }

  display() {
    // angle of the tip: 0 = straight up, positive = leaning right
    let bend = constrain(this.restLean + getBend(this.nx, this.ny, this.noiseLocation), -1.1, 1.1);
    let x0 = this.nx * REF_W;

    // points along the middle of the blade, and half the width at each point
    let steps = 7;
    let midX = [];
    let midY = [];
    let half = [];
    let cosA = [];
    let sinA = [];
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      let a = bend * t;                             // the blade turns more and more towards the tip
      // The bend angle is in radians, but the sketch uses angleMode(DEGREES), so we
      // use JavaScript's Math.sin() and Math.cos() here, which always use radians.
      midX.push(x0 + this.h * t * Math.sin(a));
      midY.push(this.baseY - this.h * t * Math.cos(a));
      half.push(this.w * 0.5 * sin(180 * (0.25 + 0.75 * t)));  // wide near the bottom, pointed at the tip
      cosA.push(Math.cos(a));
      sinA.push(Math.sin(a));
    }

    noStroke();
    // the whole blade in the darker colour
    fill(this.dark[0], this.dark[1], this.dark[2]);
    beginShape();
    for (let i = 0; i <= steps; i++) {
      vertex(midX[i] - cosA[i] * half[i], midY[i] - sinA[i] * half[i]);
    }
    for (let i = steps; i >= 0; i--) {
      vertex(midX[i] + cosA[i] * half[i], midY[i] + sinA[i] * half[i]);
    }
    endShape(CLOSE);

    // the right half again in the lighter colour
    fill(this.light[0], this.light[1], this.light[2]);
    beginShape();
    for (let i = 0; i <= steps; i++) {
      vertex(midX[i], midY[i]);
    }
    for (let i = steps; i >= 0; i--) {
      vertex(midX[i] + cosA[i] * half[i], midY[i] + sinA[i] * half[i]);
    }
    endShape(CLOSE);
  }
}

// Pick a random colour for one flower from natural wildflower colour families:
//   yellow (buttercup, dandelion) 36%    orange (marigold, hawkweed) 28%
//   red (poppy) 12%    pale green 14%    pale blue (forget-me-not) 10%
// Each family has two RGB colours at its ends (for example golden and lemon yellow).
// random() picks a point between them with lerp() (Weeks 8 and 11), so the colour is a
// different random number every time but always stays inside its family (no strong contrast).
// The centre of the flower is the same colour made darker.
// isPale = true gives soft cream-yellow or pale green flowers (the tall ones at the sides).
// Returns an object { petal, centre }, each [r, g, b].
function mixColour(colourA, colourB) {
  let t = random(0, 1);
  return [lerp(colourA[0], colourB[0], t), lerp(colourA[1], colourB[1], t), lerp(colourA[2], colourB[2], t)];
}

function pickFlowerColour(isPale) {
  let petal;
  let darkness;                                      // 1 = the centre is as light as the petals
  let family = random(0, 1);
  if (isPale) {
    petal = mixColour([250, 244, 215], [225, 244, 205]);    // cream-yellow to pale green
    darkness = 0.8;
  } else if (family < 0.36) {
    petal = mixColour([245, 195, 60], [250, 232, 105]);     // golden yellow to lemon yellow
    darkness = 0.7;
  } else if (family < 0.64) {
    petal = mixColour([240, 120, 45], [245, 170, 50]);      // orange to amber
    darkness = 0.7;
  } else if (family < 0.76) {
    petal = mixColour([225, 60, 70], [235, 105, 65]);       // crimson to coral red
    darkness = 0.65;
  } else if (family < 0.90) {
    petal = mixColour([215, 235, 160], [190, 228, 170]);    // fresh pale green
    darkness = 0.7;
  } else {
    petal = mixColour([190, 225, 245], [185, 205, 245]);    // pale blue
    darkness = 0.75;
  }
  let centre = [petal[0] * darkness, petal[1] * darkness, petal[2] * darkness];
  return { petal: petal, centre: centre };
}

// =====================================================================
// 5. CLASS: ONE FLOWER (a new random colour every time the umbrella is opened again)
// =====================================================================
class Flower {
  constructor(nx, baseY, stemH, radius, isWhite) {
    this.nx = nx;
    this.baseY = baseY;
    this.ny = baseY / REF_H;
    this.stemH = stemH;
    this.radius = radius;
    this.noiseLocation = random(0, 10);
    this.restLean = random(-0.2, 0.2);
    this.spin = random(0, TWO_PI);                  // each flower is turned a different way
    this.bloomAt = random(0, 0.9);                  // flowerBloom must pass this number for the flower to appear
    this.isWhite = isWhite;                         // true = a pale (cream or pale green) flower
    this.wasHidden = false;
    this.newColour();
  }

  // A new random colour. This is called every time the flower disappears, so when the
  // umbrella is opened again the flower comes back in a different colour.
  newColour() {
    let flowerColour = pickFlowerColour(this.isWhite);
    this.petal = flowerColour.petal;
    this.centre = flowerColour.centre;
  }

  display() {
    // grows from nothing to full size between flowerBloom = bloomAt and bloomAt + 0.12
    let grow = constrain((flowerBloom - this.bloomAt) / 0.12, 0, 1);
    if (grow <= 0) {
      if (!this.wasHidden) {                        // it has just disappeared: choose its next colour
        this.newColour();
        this.wasHidden = true;
      }
      return;
    }
    this.wasHidden = false;
    let bend = this.restLean + getBend(this.nx, this.ny, this.noiseLocation) * 1.2;
    let x0 = this.nx * REF_W;
    let h = this.stemH * grow;
    let tipX = x0 + h * Math.sin(bend);             // Math.sin / Math.cos: the bend is in radians
    let tipY = this.baseY - h * Math.cos(bend);
    let midX = x0 + h * 0.5 * Math.sin(bend * 0.4);
    let midY = this.baseY - h * 0.5 * Math.cos(bend * 0.4);

    // the stem: two short lines, so it looks curved
    stroke(76, 128, 74);
    strokeWeight(4);
    line(x0, this.baseY, midX, midY);
    line(midX, midY, tipX, tipY);

    // the flower head: five round petals and a centre
    noStroke();
    let r = this.radius * grow;
    fill(this.petal[0], this.petal[1], this.petal[2]);
    for (let i = 0; i < 5; i++) {
      let a = this.spin + (TWO_PI * i) / 5;
      ellipse(tipX + Math.cos(a) * r * 0.55, tipY + Math.sin(a) * r * 0.55, r * 0.95, r * 0.95);
    }
    fill(this.centre[0], this.centre[1], this.centre[2]);
    ellipse(tipX, tipY, r * 0.5, r * 0.5);
  }
}

// Where a row stands between the horizon (0) and the front of the picture (1).
// lerp() between depth and depth * depth keeps the far rows closer together.
function rowPosition(depth) {
  return lerp(depth, depth * depth, 0.3);
}

// A random place near the left or the right edge of the picture (for the tall reeds and flowers).
function sideX() {
  if (random(0, 1) < 0.5) {
    return random(0, 0.1);
  } else {
    return random(0.88, 1.0);
  }
}

// =====================================================================
// 6. BUILDING THE MEADOW
// =====================================================================
function setupMeadow() {
  meadowRows = [];
  for (let r = 0; r < rowCount; r++) {
    let depth = r / (rowCount - 1);                 // 0 = far hill ... 1 = front of the picture
    let row = [];

    // blades: bigger, fewer and closer to the bottom as the row gets nearer
    let bladeCount = lerp(46, 26, depth);            // the for loop below stops at the first whole number past it
    for (let i = 0; i < bladeCount; i++) {
      let nx = random(-0.03, 1.03);
      let baseY = lerp(ridgeY(nx), REF_H * 1.04, rowPosition(depth));
      let h = lerp(55, 250, depth) * random(0.7, 1.3);
      let w = lerp(28, 88, depth) * random(0.8, 1.25);
      row.push(new GrassBlade(nx, baseY, h, w, pickGrassColour(nx, depth), random(-0.3, 0.3)));
    }

    // buttercups stand in the same row, after its blades
    if (r >= 1) {
      for (let i = 0; i < flowersPerRow; i++) {
        let nx = random(0, 1);
        let baseY = lerp(ridgeY(nx), REF_H * 1.04, rowPosition(depth));
        let stemH = lerp(50, 210, depth) * random(0.8, 1.4);
        let radius = lerp(11, 30, depth) * random(0.85, 1.2);
        row.push(new Flower(nx, baseY, stemH, radius, random(0, 1) < 0.15));
      }
    }
    meadowRows.push(row);                           // array of arrays: Week 3
  }

  // a few tall reeds and white flowers at the sides of the picture (they go in a near row)
  let reedRow = meadowRows[rowCount - 5];
  for (let i = 0; i < 14; i++) {
    let nx = sideX();
    let baseY = lerp(ridgeY(nx), REF_H * 1.04, 0.5);
    reedRow.push(new GrassBlade(nx, baseY, random(300, 420), random(12, 20), pickGrassColour(nx, 0.6), random(-0.15, 0.2)));
  }
  for (let i = 0; i < 10; i++) {
    let nx = sideX();
    let baseY = lerp(ridgeY(nx), REF_H * 1.04, 0.55);
    reedRow.push(new Flower(nx, baseY, random(280, 380), random(14, 22), true));
  }

  flowerBloom = 0;
}

// =====================================================================
// 7. LINKS TO THE UMBRELLA
// =====================================================================
// The grass leans the way the umbrella moves. How fast the umbrella turns
// (its angle in degrees now minus its angle in the last frame) becomes a push of -1 ... 1.
// lerp() makes the grass follow slowly, like a breeze, and fall back to calm.
function updateGrassFromUmbrella(angle) {
  let speed = angle - lastUmbrellaAngle;
  lastUmbrellaAngle = angle;
  let target = constrain(speed / 4, -1, 1);
  umbrellaPush = lerp(umbrellaPush, target, 0.04);
}

// Flowers appear while the umbrella is open and slowly go again while it is closed.
function updateFlowers(isOpen) {
  if (isOpen) {
    flowerBloom = constrain(flowerBloom + bloomSpeed, 0, 1);
  } else {
    flowerBloom = constrain(flowerBloom - bloomSpeed, 0, 1);
  }
}

// =====================================================================
// 8. DRAWING THE MEADOW  (called every frame, drawn last: it is in front)
// =====================================================================
function drawMeadow() {
  noiseTime = noiseTime + windSpeed;

  // the ground behind the blades
  noStroke();
  fill(116, 156, 70);
  beginShape();
  for (let i = 0; i <= 20; i++) {
    vertex((i / 20) * REF_W, ridgeY(i / 20));
  }
  vertex(REF_W, REF_H + 10);
  vertex(0, REF_H + 10);
  endShape(CLOSE);

  for (let r = 0; r < meadowRows.length; r++) {
    for (let i = 0; i < meadowRows[r].length; i++) {
      meadowRows[r][i].display();
    }
  }
}
