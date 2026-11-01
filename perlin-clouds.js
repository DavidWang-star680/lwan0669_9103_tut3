// perlin-clouds.js
// PERLIN NOISE mechanic (part 1): soft Ghibli-style clouds.
// Each cloud is a row of round puffs on a flat base. Perlin noise makes every
// puff slowly "breathe" (get a little bigger and smaller) and makes the cloud
// drift at a speed that changes gently, so the sky is never still.
// The colours come from the season (seasonColour() in time-based-sky.js).
//
// Techniques ("(Week N)" = the Canvas module where it is taught):
//   noise(), random()                                          (Week 8)
//   class, constructor, this, methods                          (Week 7)
//   arrays and array.push()                                    (Week 3, 8)
//   objects { name: value }                                    (Week 3)
//   for loops, if                                              (Week 4)
//   ellipse(), rect(), fill(), noStroke()                      (Week 6)
//   lerp(), map()                                              (Week 10, 11)
//   AI note: written with the help of Claude (Anthropic).

let clouds = [];

// Where the clouds start: x of the middle, y of the flat bottom, and the width
// (in picture units, laid out like the clouds of the reference picture).
const cloudLayout = [
  [190, 490, 560],
  [525, 680, 450],
  [905, 275, 220],
  [955, 405, 240],
  [935, 600, 320],
  [960, 775, 270],
  [135, 715, 350],
  [90, 830, 230],
  [195, 190, 130],
  [468, 415, 66],
  [62, 540, 76],
  [250, 590, 90],
  [925, 900, 180]
];

class Cloud {
  constructor(x, baseY, w) {
    this.x = x;
    this.baseY = baseY;
    this.w = w;
    this.speed = random(0.1, 0.22);               // random(a, b): Week 8
    this.seed = random(0, 1000);                  // this cloud's own place in the noise

    // The puffs: a list of objects { dx, r, seed }.
    this.puffs = [];
    let count = floor(map(w, 60, 560, 3, 7));     // bigger clouds have more puffs
    for (let i = 0; i < count; i++) {
      let t = i / (count - 1);
      let middle = sin(t * 180);                  // 0 at the ends, 1 in the middle (degrees)
      this.puffs.push({
        dx: lerp(-w * 0.36, w * 0.36, t) + random(-w * 0.03, w * 0.03),
        r: lerp(0.09, 0.2, middle) * w * random(0.85, 1.15),
        seed: random(0, 1000)
      });
    }
  }

  update() {
    // Perlin noise makes the speed change slowly between about half and one and a half.
    let drift = this.speed * (0.5 + noise(this.seed, frameCount * 0.003));
    this.x = this.x + drift;
    if (this.x - this.w / 2 > REF_W) {            // gone off the right: come back on the left
      this.x = -this.w / 2;
    }
  }

  // One copy of the cloud shape, in one colour. (offsetX, offsetY) moves it.
  drawShape(colour, offsetX, offsetY, shrink) {
    noStroke();
    fill(colour[0], colour[1], colour[2]);
    for (let i = 0; i < this.puffs.length; i++) {
      let p = this.puffs[i];
      let breath = 0.9 + 0.2 * noise(p.seed, frameCount * 0.004);   // the puff gets bigger and smaller
      let r = p.r * breath * shrink;
      ellipse(this.x + p.dx + offsetX, this.baseY - p.r * 0.5 + offsetY, r * 2, r * 2);
    }
    // the flat, rounded base
    rect(this.x - this.w * 0.46 + offsetX, this.baseY - this.w * 0.1 + offsetY, this.w * 0.92, this.w * 0.1, this.w * 0.05);
  }

  display() {
    let light = seasonColour('cloud');
    let shade = seasonColour('shade');
    this.drawShape(shade, 0, 0, 1);                          // the blue shadow first ...
    this.drawShape(light, this.w * 0.025, -this.w * 0.04, 0.96);   // ... then the light cloud, a little up and right
  }
}

function setupClouds() {
  clouds = [];
  for (let i = 0; i < cloudLayout.length; i++) {
    let c = cloudLayout[i];                       // array[0], [1], [2]: Week 3
    clouds.push(new Cloud(c[0] + random(-40, 40), c[1] + random(-12, 12), c[2]));
  }
}

function drawClouds() {
  for (let i = 0; i < clouds.length; i++) {
    clouds[i].update();
    clouds[i].display();
  }
}
