// perlin-clouds.js
// MECHANIC: Perlin noise and randomness - the clouds  (owner: Lizuo Wang)
// Iteration 2: the clouds of the sky now move and change with noise() and
// random(), just like the grass. Which clouds we see, how thick they are
// and how high they float still depends on the season.
//
// BUILT ON Fei Jiang's time-based-sky.js
//   - the cloud shapes (drawBigCloud1/2/3, drawMediumCloud, drawSmallCloud)
//     are Fei's, we only call them;
//   - the season clock (seasonFrame = frameCount % 1500) and the season
//     colours are Fei's. drawSky() calls drawNoiseClouds(seasonFrame).
//
// AI note: this file was written with the help of Claude (Anthropic).
// Claude generated the structure and the season blending; I read, tested
// and adjusted it.
//
// Only techniques taught in IDEA9103 are used. "(Week N)" = the Canvas
// module where the course teaches it (Week 3 = objects and arrays,
// Week 4 = conditionals and loops, Week 6 = p5.js, Week 7 = OOP,
// Week 8 = Perlin noise, Week 10 = Sound, Week 11 = Easing and Animation).

// =====================================================================
// 1. SETTINGS  (change these numbers to tune the clouds)
// =====================================================================
const cloudCount = 16;      // how many clouds exist in total (const: Week 2)
const cloudTop = 0.05;      // highest a cloud can float (fraction of canvas height)

// One value per season, in this order: 0 = spring, 1 = summer, 2 = autumn, 3 = winter.
// While the season changes, the program slides smoothly between two numbers.
//
//                        spring  summer  autumn  winter
const seasonCover     = [  0.50,   0.90,   0.28,   0.16 ];  // share of clouds that are visible
const seasonThickness = [  1.00,   1.40,   0.55,   1.50 ];  // 1 = normal, bigger = thicker (taller) clouds
const seasonLowest    = [  0.36,   0.38,   0.18,   0.18 ];  // lowest a cloud may float (fraction of canvas height)

// Cloud and shadow colours: these are Fei's season colours, as [red, green, blue].
const seasonCloudColour  = [[250, 248, 240], [255, 253, 245], [225, 190, 160], [195, 205, 215]];
const seasonShadowColour = [[210, 225, 235], [215, 235, 245], [190, 145, 125], [150, 165, 180]];

// =====================================================================
// 2. VARIABLES THAT CHANGE WHILE THE SKETCH RUNS
// =====================================================================
let noiseClouds = [];       // all the NoiseCloud objects (array: Week 3)
let cloudClock = 0;         // counts frames; makes the clouds drift sideways
let cloudNoiseTime = 0;     // our position in the noise; it grows, so the clouds change

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

// Value of a season table (like seasonCover) for the current blend. lerp(): Week 11
function seasonValue(table, blend) {
  return lerp(table[blend.from], table[blend.to], blend.amount);
}

// Colour of a season table of colours, blended, as [red, green, blue].
function seasonColour(table, blend) {
  return [
    lerp(table[blend.from][0], table[blend.to][0], blend.amount),
    lerp(table[blend.from][1], table[blend.to][1], blend.amount),
    lerp(table[blend.from][2], table[blend.to][2], blend.amount)
  ];
}

// =====================================================================
// 4. CLASS: ONE CLOUD  (class and constructor: Week 7)
// =====================================================================
// Everything about the cloud that is chosen "by chance" is chosen once with
// random() in the constructor and then kept. While the sketch runs,
// noise() makes the cloud drift, change size, tilt and move up and down.
class NoiseCloud {
  constructor(rank) {
    // rank: 0 - 1. Clouds with a low rank are shown first and last to go, so
    // when there are few clouds (autumn, winter) they are the big ones.
    this.rank = rank;

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
    this.driftSpeed = random(0.00003, 0.00009);     // how fast it drifts to the right
    this.noiseLocation = random(0, 100);            // its own place in the noise
  }

  display(blend) {
    // 1. How much of this cloud do we see? 0 = hidden, 1 = fully there.
    //    It fades in or out when the season's cloud cover passes its rank.
    let cover = seasonValue(seasonCover, blend);
    let visible = constrain((cover - this.rank) * 25, 0, 1);  // constrain: Week 6
    if (visible <= 0) {
      return;                                       // nothing to draw
    }

    let thickness = seasonValue(seasonThickness, blend);
    let lowest = seasonValue(seasonLowest, blend);
    let unit = min(width, height) / 700;            // Fei's clouds were made for a 700 px tall canvas

    // 2. Position. It drifts slowly to the right and wraps around
    //    ( % = remainder: Week 8 ) and noise() wobbles it a little.
    let driftX = ((this.homeX + 0.2 + cloudClock * this.driftSpeed) % 1.4) - 0.2;
    let wobbleX = (noise(this.noiseLocation + cloudNoiseTime) - 0.5) * 0.08;
    let wobbleY = (noise(this.noiseLocation + 50 + cloudNoiseTime) - 0.5) * 0.04;
    let x = (driftX + wobbleX) * width;
    // the sky band gets lower or higher with the season (higher in autumn)
    let y = (lerp(cloudTop, lowest, this.row) + wobbleY) * height;

    // 3. Size and tilt also change slowly with noise(). map(): Week 10, 11
    let breathe = map(noise(this.noiseLocation + 100 + cloudNoiseTime), 0.2, 0.8, 0.85, 1.2);
    let tiltNow = this.tilt + (noise(this.noiseLocation + 150 + cloudNoiseTime) - 0.5) * 10;

    // 4. Colours come from the season. color(r, g, b, alpha): Week 7, 11
    let c = seasonColour(seasonCloudColour, blend);
    let s = seasonColour(seasonShadowColour, blend);
    let mainColour = color(c[0], c[1], c[2], 255 * visible);
    let shadowColour = color(s[0], s[1], s[2], 255 * visible);

    // 5. Draw with Fei's shape functions. translate() moves to the cloud,
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
// 5. FUNCTIONS THAT THE REST OF THE PROJECT CALLS
// =====================================================================

// Make all the clouds. Called once from setup() (and again by scatterClouds()).
function setupClouds() {
  noiseClouds = [];
  for (let i = 0; i < cloudCount; i++) {            // for loop: Week 4
    let rank = (i + random(0, 1)) / cloudCount;     // spread the ranks evenly from 0 to 1
    noiseClouds.push(new NoiseCloud(rank));         // push(): Week 7, 8
  }
}

// Throw the clouds down again in new random places and shapes.
function scatterClouds() {
  setupClouds();
}

// Draw all the clouds for this moment in the season. Called from Fei's drawSky().
function drawNoiseClouds(seasonFrame) {
  cloudClock = cloudClock + 1;
  cloudNoiseTime = cloudNoiseTime + 0.003;          // small step = slow change

  let blend = getSeasonBlend(seasonFrame);
  for (let i = 0; i < noiseClouds.length; i++) {
    noiseClouds[i].display(blend);
  }
}
