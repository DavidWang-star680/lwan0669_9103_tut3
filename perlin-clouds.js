// perlin-clouds.js
// MECHANIC: Perlin noise and randomness - the clouds  (owner: Lizuo Wang)
// The clouds of the sky move and change with noise() and random(), just like
// the grass. Which clouds we see, how thick they are, how high they float
// and how fast they drift depends on the season.
//
// Iteration 4: every season has its OWN layer of clouds. When the season
// changes, the old layer fades out and a new layer, with new random clouds,
// fades in. The fade lasts exactly as long as the change of season (the
// "amount" from getSeasonBlend() is the fade). Summer has many clouds and a few towering storm clouds
// (cumulonimbus). This file also gives the haze colour for the horizon.
//
// BUILT ON Fei Jiang's time-based-sky.js
//   - the cloud shapes (drawBigCloud1/2/3, drawMediumCloud, drawSmallCloud)
//     are Fei's, we only call them;
//   - the season clock (seasonFrame) and the sky colours are Fei's.
//     drawSky() calls drawSunAndClouds(seasonFrame), which is in this file.
//
// AI note: this file was written with the help of Claude (Anthropic).
// Claude generated the structure and the season layers; I read, tested
// and adjusted it.
//
// Only techniques taught in IDEA9103 are used. "(Week N)" = the Canvas
// module where the course teaches it (Week 3 = objects and arrays,
// Week 4 = conditionals and loops, Week 6 = p5.js, Week 7 = OOP,
// Week 8 = Perlin noise, Week 10 = Sound, Week 11 = Easing and Animation).

// =====================================================================
// 1. SETTINGS  (change these numbers to tune the clouds)
// =====================================================================
const cloudTop = 0.05;      // highest a cloud can float (fraction of canvas height)

// One value per season, in this order: 0 = spring, 1 = summer, 2 = autumn, 3 = winter.
//
//                        spring  summer  autumn  winter
const seasonCount     = [  8,      20,      5,      3    ];   // how many normal clouds
const seasonTowers    = [  0,       4,      0,      0    ];   // how many storm clouds (summer only)
const seasonRankScale = [  1.0,    1.0,    0.6,    0.45 ];   // small number = more big clouds
const seasonThickness = [  1.00,   1.45,   0.55,   1.50 ];   // 1 = normal, bigger = thicker (taller) clouds
const seasonLowest    = [  0.50,   0.54,   0.30,   0.30 ];   // lowest a cloud may float (fraction of canvas height)
const seasonSpeed     = [  1.3,    2.0,    1.4,    1.2  ];   // how fast clouds drift and change (summer is fastest)

// Cloud and shadow colours: these are Fei's season colours, as [red, green, blue].
const seasonCloudColour  = [[250, 248, 240], [255, 253, 245], [225, 190, 160], [195, 205, 215]];
const seasonShadowColour = [[210, 225, 235], [215, 235, 245], [190, 145, 125], [150, 165, 180]];

// Fei's sky colours: top and bottom of the sky for each season. The haze at
// the horizon takes its colour from these.
const seasonSkyTop    = [[55, 125, 190], [65, 150, 220], [185, 105, 55], [90, 115, 145]];
const seasonSkyBottom = [[145, 195, 225], [170, 225, 245], [245, 190, 115], [180, 195, 210]];

// =====================================================================
// 2. VARIABLES THAT CHANGE WHILE THE SKETCH RUNS
// =====================================================================
let cloudLayers = [];       // one layer per season; each layer holds its own clouds (array: Week 3)
let currentBlend = { from: 0, to: 0, amount: 0 };   // where we are between two seasons (set every frame)

// =====================================================================
// 3. HELPER FUNCTIONS
// =====================================================================

// Which two seasons are we between right now, and how far (0 - 1)?
// The frame numbers are the same as in Fei's drawSky() (keep them in sync):
//   0-225 spring | 225-375 spring to summer | 375-600 summer | 600-750 summer to autumn
//   750-915 autumn | 915-1125 autumn to winter | 1125-1290 winter | 1290-1500 winter to spring
// "from" and "to" are season numbers 0 - 3; amount = 0 means "still from", 1 means "arrived at to".
function getSeasonBlend(seasonFrame) {
  let amount = 0;
  if (seasonFrame < 225) {
    return { from: 0, to: 0, amount: 0 };
  } else if (seasonFrame < 375) {
    return { from: 0, to: 1, amount: (seasonFrame - 225) / 150 };
  } else if (seasonFrame < 600) {
    return { from: 1, to: 1, amount: 0 };
  } else if (seasonFrame < 750) {
    return { from: 1, to: 2, amount: (seasonFrame - 600) / 150 };
  } else if (seasonFrame < 915) {
    return { from: 2, to: 2, amount: 0 };
  } else if (seasonFrame < 1125) {
    amount = (seasonFrame - 915) / 210;
    return { from: 2, to: 3, amount: amount * amount * (3 - 2 * amount) };   // eased, like Fei's
  } else if (seasonFrame < 1290) {
    return { from: 3, to: 3, amount: 0 };
  } else {
    amount = (seasonFrame - 1290) / 210;
    return { from: 3, to: 0, amount: amount * amount * (3 - 2 * amount) };
  }
}

// The season whose clouds we want to see now. As soon as a change of season
// starts, we already want the clouds of the NEW season.
function getCloudSeason(blend) {
  if (blend.amount > 0) {
    return blend.to;
  }
  return blend.from;
}

// The colour of the sky at the horizon, for the horizon haze (perlin-grass.js
// uses it). t = 0.85 means "almost at the bottom of Fei's gradient".
// Returns [red, green, blue], blended between two seasons. lerp(): Week 11
function getHazeColour(blend) {
  let t = 0.85;
  let from = [
    lerp(seasonSkyTop[blend.from][0], seasonSkyBottom[blend.from][0], t),
    lerp(seasonSkyTop[blend.from][1], seasonSkyBottom[blend.from][1], t),
    lerp(seasonSkyTop[blend.from][2], seasonSkyBottom[blend.from][2], t)
  ];
  let to = [
    lerp(seasonSkyTop[blend.to][0], seasonSkyBottom[blend.to][0], t),
    lerp(seasonSkyTop[blend.to][1], seasonSkyBottom[blend.to][1], t),
    lerp(seasonSkyTop[blend.to][2], seasonSkyBottom[blend.to][2], t)
  ];
  return [
    lerp(from[0], to[0], blend.amount),
    lerp(from[1], to[1], blend.amount),
    lerp(from[2], to[2], blend.amount)
  ];
}

// =====================================================================
// 4. CLASS: ONE NORMAL CLOUD  (class and constructor: Week 7)
// =====================================================================
// Everything about the cloud that is chosen "by chance" is chosen once with
// random() in the constructor and then kept. While the sketch runs,
// noise() makes the cloud drift, change size, tilt and move up and down.
class NoiseCloud {
  constructor(rank, season) {
    // rank: 0 - 1. Low rank = big cloud, high rank = small cloud.
    this.season = season;

    // size of cloud: big, medium or small. Fei's shape functions are used for each.
    if (rank < 0.35) {
      this.kind = 0;                                // big cloud
      this.size = random(0.7, 1.05);                // random(a, b): Week 6, 8
    } else if (rank < 0.7) {
      this.kind = 1;                                // medium cloud
      this.size = random(0.35, 0.55);
    } else {
      this.kind = 2;                                // small cloud
      this.size = random(0.2, 0.3);
    }

    // which of Fei's three big cloud shapes to use (A, B or C)
    let pick = random(0, 1);
    if (pick < 0.33) {
      this.shape = 0;
    } else if (pick < 0.66) {
      this.shape = 1;
    } else {
      this.shape = 2;
    }

    this.homeX = random(-0.1, 1.1);                 // where it starts sideways (fraction of width)
    this.row = random(0, 1);                        // 0 = top of the sky band ... 1 = bottom of it
    this.tilt = random(-10, 10);                    // tilt in degrees
    this.driftSpeed = random(0.00002, 0.00006);     // how fast it drifts to the right
    this.noiseLocation = random(0, 100);            // its own place in the noise
  }

  // layer holds: alpha (how much the layer is faded in), clock and noiseTime.
  display(layer) {
    let thickness = seasonThickness[this.season];
    let lowest = seasonLowest[this.season];
    let unit = min(width, height) / 700;            // Fei's clouds were made for a 700 px tall canvas

    // 1. Position. It drifts slowly to the right and wraps around
    //    ( % = remainder: Week 8 ) and noise() wobbles it a little.
    let driftX = ((this.homeX + 0.2 + layer.clock * this.driftSpeed) % 1.4) - 0.2;
    let wobbleX = (noise(this.noiseLocation + layer.noiseTime) - 0.5) * 0.08;
    let wobbleY = (noise(this.noiseLocation + 50 + layer.noiseTime) - 0.5) * 0.04;
    let x = (driftX + wobbleX) * width;
    // the sky band is lower or higher with the season (higher in autumn)
    let y = (lerp(cloudTop, lowest, this.row) + wobbleY) * height;

    // 2. Size and tilt also change slowly with noise(). map(): Week 10, 11
    let breathe = map(noise(this.noiseLocation + 100 + layer.noiseTime), 0.2, 0.8, 0.85, 1.2);
    let tiltNow = this.tilt + (noise(this.noiseLocation + 150 + layer.noiseTime) - 0.5) * 10;

    // 3. Colours come from the season; the alpha is the layer's fade. color(r, g, b, alpha): Week 7, 11
    let c = seasonCloudColour[this.season];
    let s = seasonShadowColour[this.season];
    let mainColour = color(c[0], c[1], c[2], 255 * layer.alpha);
    let shadowColour = color(s[0], s[1], s[2], 255 * layer.alpha);

    // 4. Draw with Fei's shape functions. translate() moves to the cloud,
    //    scale(1, thickness) makes it flatter (thin) or taller (thick). Week 11
    push();
    translate(x, y);
    scale(1, thickness);
    if (this.kind === 0) {
      if (this.shape === 0) {
        drawBigCloud1(0, 0, this.size * breathe * unit, tiltNow, mainColour, shadowColour);
      } else if (this.shape === 1) {
        drawBigCloud2(0, 0, this.size * breathe * unit, tiltNow, mainColour, shadowColour);
      } else {
        drawBigCloud3(0, 0, this.size * breathe * unit, tiltNow, mainColour, shadowColour);
      }
    } else if (this.kind === 1) {
      drawMediumCloud(0, 0, this.size * breathe * unit, tiltNow, mainColour);
    } else {
      drawSmallCloud(0, 0, this.size * breathe * unit, tiltNow, mainColour);
    }
    pop();
  }
}

// =====================================================================
// 5. CLASS: ONE STORM CLOUD (cumulonimbus), only in summer
// =====================================================================
// A tall, thick cloud: a dark flat grey base, rounded lobes piled up like a
// tower, and a flat "anvil" on top. It is built from ellipses. Every lobe is
// chosen with random() once; noise() makes the lobes billow slowly.
class StormCloud {
  constructor(season) {
    this.season = season;
    this.size = random(0.8, 1.2);
    this.homeX = random(0, 1);
    this.row = random(0, 1);
    this.driftSpeed = random(0.00002, 0.00005);
    this.noiseLocation = random(0, 100);

    // Each lobe is an object { dx, dy, w, h } in "cloud units": dx = sideways,
    // dy = how high above the base (0 = base, 1 = top), w and h = size.
    this.lobes = [];
    for (let i = 0; i < 7; i++) {                   // the wide base
      this.lobes.push({ dx: map(i, 0, 6, -0.62, 0.62) + random(-0.05, 0.05), dy: random(0, 0.06), w: random(0.38, 0.5), h: random(0.2, 0.28) });
    }
    for (let i = 0; i < 6; i++) {                   // the lower body
      this.lobes.push({ dx: map(i, 0, 5, -0.45, 0.45) + random(-0.05, 0.05), dy: random(0.2, 0.34), w: random(0.34, 0.46), h: random(0.26, 0.34) });
    }
    for (let i = 0; i < 5; i++) {                   // the upper body
      this.lobes.push({ dx: map(i, 0, 4, -0.3, 0.3) + random(-0.05, 0.05), dy: random(0.46, 0.62), w: random(0.3, 0.4), h: random(0.24, 0.32) });
    }
    for (let i = 0; i < 3; i++) {                   // the bright round top
      this.lobes.push({ dx: map(i, 0, 2, -0.16, 0.16) + random(-0.04, 0.04), dy: random(0.74, 0.86), w: random(0.28, 0.36), h: random(0.24, 0.3) });
    }
  }

  display(layer) {
    let unit = min(width, height) / 700;
    let size = 300 * this.size * unit;              // height of the tower in pixels
    let lowest = seasonLowest[this.season];

    let driftX = ((this.homeX + 0.2 + layer.clock * this.driftSpeed) % 1.4) - 0.2;
    let x = (driftX + (noise(this.noiseLocation + layer.noiseTime) - 0.5) * 0.04) * width;
    let baseY = lerp(0.4, lowest, this.row) * height;   // y of the flat base

    let c = seasonCloudColour[this.season];
    let s = seasonShadowColour[this.season];
    let a = 255 * layer.alpha;

    noStroke();
    push();
    translate(x, baseY);

    // flat dark underside
    fill(s[0] * 0.72, s[1] * 0.72, s[2] * 0.78, a);
    ellipse(0, size * 0.02, size * 1.5, size * 0.2);

    // the lobes, from the bottom to the top. The higher the lobe, the brighter it is.
    for (let i = 0; i < this.lobes.length; i++) {   // for loop: Week 4
      let lobe = this.lobes[i];
      let bright = constrain(lobe.dy * 1.6, 0, 1);
      let r = lerp(s[0] * 0.8, c[0], bright);
      let g = lerp(s[1] * 0.8, c[1], bright);
      let b = lerp(s[2] * 0.85, c[2], bright);
      let billow = (noise(this.noiseLocation + i * 3 + layer.noiseTime) - 0.5) * 0.06;   // noise: Week 8
      fill(r, g, b, a);
      ellipse((lobe.dx + billow) * size, -(lobe.dy + billow * 0.5) * size, lobe.w * size * 1.15, lobe.h * size * 1.15);
    }

    // the flat anvil at the very top
    fill(c[0], c[1], c[2], a);
    ellipse(0.05 * size, -0.98 * size, size * 1.0, size * 0.2);
    fill(s[0], s[1], s[2], a * 0.8);
    ellipse(0.05 * size, -0.93 * size, size * 0.8, size * 0.1);

    // a bright patch on the sunny top (the light comes from the upper right)
    fill(255, 255, 255, a * 0.55);
    ellipse(0.1 * size, -0.82 * size, size * 0.3, size * 0.16);
    pop();
  }
}

// =====================================================================
// 6. LAYERS: ONE SET OF CLOUDS FOR EACH SEASON
// =====================================================================

// Make a new layer of clouds for one season (season = 0 - 3).
// alpha = 0 means "invisible, will fade in"; 1 means "fully there".
function makeCloudLayer(season, alpha) {
  let layer = { season: season, alpha: alpha, clock: 0, noiseTime: random(0, 50), clouds: [] };

  for (let i = 0; i < seasonTowers[season]; i++) {  // the storm clouds first, so they are at the back
    layer.clouds.push(new StormCloud(season));
  }
  let count = seasonCount[season];
  for (let i = 0; i < count; i++) {
    let rank = ((i + random(0, 1)) / count) * seasonRankScale[season];
    layer.clouds.push(new NoiseCloud(rank, season)); // push(): Week 7, 8
  }
  return layer;
}

// =====================================================================
// 7. FUNCTIONS THAT THE REST OF THE PROJECT CALLS
// =====================================================================

// Make the first layer of clouds (spring). Called once from setup().
function setupClouds() {
  cloudLayers = [makeCloudLayer(0, 1)];
}

// Throw the clouds down again in new random places and shapes (key R).
function scatterClouds() {
  cloudLayers = [makeCloudLayer(getCloudSeason(currentBlend), 1)];
}

// Called from Fei's drawSky() in every season. The sun is drawn first, so the
// clouds are always in front of it.
function drawSunAndClouds(seasonFrame) {
  drawCycleSun();                                   // time-based-sky.js
  drawNoiseClouds(seasonFrame);
}

// Draw all the cloud layers for this moment in the season.
function drawNoiseClouds(seasonFrame) {
  currentBlend = getSeasonBlend(seasonFrame);
  let season = getCloudSeason(currentBlend);

  // A new season has started: add a new layer of clouds, invisible at first.
  let newest = cloudLayers[cloudLayers.length - 1];
  if (newest.season !== season) {
    cloudLayers.push(makeCloudLayer(season, 0));
    newest = cloudLayers[cloudLayers.length - 1];
  }

  let stillThere = [];                              // the layers we keep
  for (let i = 0; i < cloudLayers.length; i++) {
    let layer = cloudLayers[i];

    // The fade is the change of season itself: while the season changes,
    // currentBlend.amount goes slowly from 0 to 1. The new layer's alpha goes up
    // with it and the old layers' alpha goes down. When the change is over,
    // only the new layer is left (alpha 1).
    if (layer === newest) {
      if (currentBlend.amount > 0) {
        layer.alpha = currentBlend.amount;
      } else {
        layer.alpha = 1;
      }
    } else if (currentBlend.amount > 0) {
      layer.alpha = 1 - currentBlend.amount;
    } else {
      layer.alpha = 0;                              // the change is over: the old layer is gone
    }

    if (layer.alpha > 0 || layer === newest) {
      stillThere.push(layer);

      // each season has its own speed (summer is the fastest)
      layer.clock = layer.clock + seasonSpeed[layer.season];
      layer.noiseTime = layer.noiseTime + 0.0008 * seasonSpeed[layer.season];

      for (let j = 0; j < layer.clouds.length; j++) {
        layer.clouds[j].display(layer);
      }
    }
  }
  cloudLayers = stillThere;
}
