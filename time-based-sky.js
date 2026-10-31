// time-based-sky.js
// MECHANIC: Time-based - seasonal sky  (owner: Fei Jiang)
//
// Iteration 2 changes (made by Lizuo Wang with the help of Claude, Anthropic):
//   - setup() and createCanvas() moved to sketch.js, so all mechanics share
//     one canvas, and draw() was renamed drawSky(), called from sketch.js.
//   - The clouds are now drawn by drawNoiseClouds() in perlin-clouds.js
//     (random + Perlin noise, still changing with the season). The old
//     drawSpringClouds / drawSummerClouds / drawAutumnClouds / drawWinterClouds
//     functions below are no longer called and are kept only for reference.
//   - drawGradientSky() sets strokeWeight(1), because the meadow changes it.
// The cloud SHAPES (drawBigCloud1 ... drawSmallCloud) are still used.
// Iteration 4 changes:
//   - seasonFrame = (frameCount * 0.375) % 1500, so the seasons run at 37.5% of the
//     first speed (a full year now takes 4000 frames); the changes between seasons
//     last just as much longer.
//   - The snow is now drawNoiseSnow() in perlin-snow.js (bigger flakes, whole sky).
//     The old drawSnow() is no longer called.
//   - The sun is now drawCycleSun(): it crosses the sky from left to right over and
//     over, in every season. The old drawMovingSun() is no longer called. Sun and
//     clouds are drawn together by drawSunAndClouds() (perlin-clouds.js).
// Everything else (sky colours, leaves, snow) is unchanged.

let cloudMove = 0;

// Called every frame from sketch.js. Draws the sky, the sun, the clouds and
// the falling leaves / snow for the current moment of the 1500-frame season cycle.
function drawSky() {
  cloudMove = sin(frameCount * 0.4) * 20;
  let seasonFrame = (frameCount * 0.375) % 1500;  // x 0.375: every season and every change of season lasts 2.7 times longer than at first (Lizuo, iteration 4)

  if (seasonFrame < 225) {
    drawSpringSky();
    drawSunAndClouds(seasonFrame);

  } else if (seasonFrame < 375) {
    let amount = (seasonFrame - 225) / 150;

    drawSkyTransition(
      color(55, 125, 190),
      color(145, 195, 225),
      color(65, 150, 220),
      color(170, 225, 245),
      amount
    );

    drawSunAndClouds(seasonFrame);

  } else if (seasonFrame < 600) {
    drawSummerSky();
    drawSunAndClouds(seasonFrame);

  } else if (seasonFrame < 750) {
    let amount = (seasonFrame - 600) / 150;

    drawSkyTransition(
      color(65, 150, 220),
      color(170, 225, 245),
      color(185, 105, 55),
      color(245, 190, 115),
      amount
    );

    drawSunAndClouds(seasonFrame);

    let autumnAlpha = lerp(0, 255, amount);
    drawAutumnLeaves(autumnAlpha);

  } else if (seasonFrame < 915) {
    drawAutumnSky();
    drawSunAndClouds(seasonFrame);
    drawAutumnLeaves(255);

  } else if (seasonFrame < 1125) {
    let amount = (seasonFrame - 915) / 210;
    let smoothAmount = amount * amount * (3 - 2 * amount);

    drawSkyTransition(
      color(185, 105, 55),
      color(245, 190, 115),
      color(90, 115, 145),
      color(180, 195, 210),
      smoothAmount
    );

    drawSunAndClouds(seasonFrame);

    let autumnAlpha = lerp(255, 0, smoothAmount);
    drawAutumnLeaves(autumnAlpha);

    let winterAlpha = lerp(0, 255, smoothAmount);
    drawNoiseSnow(winterAlpha);

  } else if (seasonFrame < 1290) {
    drawWinterSky();
    drawSunAndClouds(seasonFrame);
    drawNoiseSnow(255);

  } else {
    let amount = (seasonFrame - 1290) / 210;
    let smoothAmount = amount * amount * (3 - 2 * amount);

    drawSkyTransition(
      color(90, 115, 145),
      color(180, 195, 210),
      color(55, 125, 190),
      color(145, 195, 225),
      smoothAmount
    );

    drawSunAndClouds(seasonFrame);

    let winterAlpha = lerp(255, 0, smoothAmount);
    drawNoiseSnow(winterAlpha);
  }
}


// =====================================================
// GRADIENT SKY
// =====================================================

function drawGradientSky(topColor, bottomColor) {
  strokeWeight(1);

  for (let y = 0; y < height; y++) {
    let amount = map(y, 0, height, 0, 1);
    let skyColor = lerpColor(topColor, bottomColor, amount);

    stroke(skyColor);
    line(0, y, width, y);
  }
}


// =====================================================
// SKY TRANSITION
// =====================================================

function drawSkyTransition(
  oldTop,
  oldBottom,
  newTop,
  newBottom,
  amount
) {
  let topColor = lerpColor(oldTop, newTop, amount);
  let bottomColor = lerpColor(oldBottom, newBottom, amount);

  drawGradientSky(topColor, bottomColor);
}


// =====================================================
// SPRING SKY
// Darker spring blue
// =====================================================

function drawSpringSky() {
  let topColor = color(55, 125, 190);
  let bottomColor = color(145, 195, 225);

  drawGradientSky(topColor, bottomColor);
}


// =====================================================
// SUMMER SKY
// =====================================================

function drawSummerSky() {
  let topColor = color(65, 150, 220);
  let bottomColor = color(170, 225, 245);

  drawGradientSky(topColor, bottomColor);
}


// =====================================================
// AUTUMN SKY
// =====================================================

function drawAutumnSky() {
  let topColor = color(185, 105, 55);
  let bottomColor = color(245, 190, 115);

  drawGradientSky(topColor, bottomColor);
}


// =====================================================
// WINTER SKY
// =====================================================

function drawWinterSky() {
  let topColor = color(90, 115, 145);
  let bottomColor = color(180, 195, 210);

  drawGradientSky(topColor, bottomColor);
}


// =====================================================
// SUN THAT CROSSES THE SKY (iteration 4, Lizuo Wang with Claude)
// The sun moves slowly from the far left to the far right and then starts
// again. It does not depend on the season, and it is drawn before the clouds,
// so the clouds are always in front of it.
// =====================================================

const sunPeriod = 2400;     // frames for one crossing of the sky

function drawCycleSun() {
  let progress = (frameCount % sunPeriod) / sunPeriod;   // 0 = far left ... 1 = far right
  let unit = min(width, height) / 700;

  let sunX = lerp(0.04, 0.96, progress) * width;
  // an arc: low at the two ends, high in the middle. Math.sin(): Week 5
  let sunY = lerp(0.40, 0.14, Math.sin(progress * Math.PI)) * height;

  // fade in at the start and fade out at the end, so the sun does not jump back
  let sunAlpha = 255 * constrain(min(progress, 1 - progress) * 14, 0, 1);

  noStroke();
  fill(255, 220, 90, sunAlpha * 0.15);
  ellipse(sunX, sunY, 150 * unit, 150 * unit);
  fill(255, 220, 80, sunAlpha * 0.30);
  ellipse(sunX, sunY, 110 * unit, 110 * unit);
  fill(255, 225, 90, sunAlpha);
  ellipse(sunX, sunY, 68 * unit, 68 * unit);
}


// =====================================================
// OLD MOVING SUN (no longer used)
// =====================================================

function drawMovingSun(seasonFrame, sunAlpha) {
  let sunProgress = map(
    seasonFrame,
    225,
    750,
    0,
    1
  );

  sunProgress = constrain(
    sunProgress,
    0,
    1
  );

  let sunX = lerp(
    60,
    540,
    sunProgress
  );

  let sunY =
    200 -
    sin(sunProgress * 180) * 120;

  noStroke();

  fill(
    255,
    220,
    90,
    sunAlpha * 0.15
  );

  ellipse(
    sunX,
    sunY,
    150,
    150
  );

  fill(
    255,
    220,
    80,
    sunAlpha * 0.30
  );

  ellipse(
    sunX,
    sunY,
    110,
    110
  );

  fill(
    255,
    225,
    90,
    sunAlpha
  );

  ellipse(
    sunX,
    sunY,
    68,
    68
  );
}


// =====================================================
// SPRING CLOUDS
// =====================================================

function drawSpringClouds(alphaValue) {
  let bigCloudColor =
    color(250, 248, 240, alphaValue);

  let bigShadowColor =
    color(210, 225, 235, alphaValue);

  let mediumCloudColor =
    color(250, 248, 240, alphaValue);

  let smallCloudColor =
    color(185, 205, 220, alphaValue);


  drawBigCloud1(
    110 + cloudMove,
    150,
    1.00,
    10,
    bigCloudColor,
    bigShadowColor
  );

  drawBigCloud2(
    130 + cloudMove,
    285,
    0.95,
    8,
    bigCloudColor,
    bigShadowColor
  );

  drawBigCloud3(
    165 + cloudMove,
    440,
    0.82,
    12,
    bigCloudColor,
    bigShadowColor
  );

  drawBigCloud4(
    305 + cloudMove,
    230,
    1.05,
    0,
    bigCloudColor,
    bigShadowColor
  );

  drawBigCloud5(
    485 + cloudMove,
    145,
    1.00,
    -10,
    bigCloudColor,
    bigShadowColor
  );

  drawBigCloud6(
    475 + cloudMove,
    315,
    0.88,
    -8,
    bigCloudColor,
    bigShadowColor
  );

  drawBigCloud7(
    440 + cloudMove,
    470,
    0.80,
    -12,
    bigCloudColor,
    bigShadowColor
  );


  drawMediumCloud(
    250,
    95,
    0.50,
    5,
    mediumCloudColor
  );

  drawMediumCloud(
    325,
    115,
    0.42,
    0,
    mediumCloudColor
  );

  drawMediumCloud(
    515,
    95,
    0.45,
    -5,
    mediumCloudColor
  );

  drawMediumCloud(
    80,
    520,
    0.42,
    8,
    mediumCloudColor
  );

  drawMediumCloud(
    330,
    520,
    0.45,
    -4,
    mediumCloudColor
  );

  drawMediumCloud(
    535,
    380,
    0.40,
    -8,
    mediumCloudColor
  );

  drawMediumCloud(
    190,
    80,
    0.36,
    6,
    mediumCloudColor
  );

  drawMediumCloud(
    390,
    78,
    0.34,
    -4,
    mediumCloudColor
  );

  drawMediumCloud(
    555,
    245,
    0.34,
    -8,
    mediumCloudColor
  );

  drawMediumCloud(
    250,
    575,
    0.36,
    4,
    mediumCloudColor
  );

  drawMediumCloud(
    455,
    560,
    0.34,
    -6,
    mediumCloudColor
  );


  drawSmallCloud(
    85,
    70,
    0.28,
    5,
    smallCloudColor
  );

  drawSmallCloud(
    220,
    60,
    0.24,
    2,
    smallCloudColor
  );

  drawSmallCloud(
    470,
    70,
    0.26,
    -4,
    smallCloudColor
  );

  drawSmallCloud(
    560,
    210,
    0.22,
    -8,
    smallCloudColor
  );

  drawSmallCloud(
    70,
    600,
    0.20,
    5,
    smallCloudColor
  );

  drawSmallCloud(
    145,
    55,
    0.18,
    4,
    smallCloudColor
  );

  drawSmallCloud(
    300,
    55,
    0.16,
    0,
    smallCloudColor
  );

  drawSmallCloud(
    520,
    60,
    0.18,
    -4,
    smallCloudColor
  );

  drawSmallCloud(
    275,
    350,
    0.16,
    3,
    smallCloudColor
  );

  drawSmallCloud(
    90,
    360,
    0.17,
    6,
    smallCloudColor
  );

  drawSmallCloud(
    560,
    430,
    0.18,
    -6,
    smallCloudColor
  );

  drawSmallCloud(
    150,
    610,
    0.16,
    4,
    smallCloudColor
  );

  drawSmallCloud(
    520,
    610,
    0.17,
    -4,
    smallCloudColor
  );
}


// =====================================================
// SUMMER CLOUDS
// =====================================================

function drawSummerClouds(alphaValue) {
  let summerCloudColor =
    color(255, 253, 245, alphaValue);

  let summerShadowColor =
    color(215, 235, 245, alphaValue);


  drawBigCloud1(
    120 + cloudMove,
    145,
    0.85,
    5,
    summerCloudColor,
    summerShadowColor
  );

  drawBigCloud5(
    480 + cloudMove,
    260,
    0.75,
    -6,
    summerCloudColor,
    summerShadowColor
  );

  drawMediumCloud(
    330,
    90,
    0.45,
    0,
    summerCloudColor
  );

  drawSmallCloud(
    540,
    90,
    0.25,
    -5,
    summerCloudColor
  );

  drawSmallCloud(
    210,
    500,
    0.22,
    4,
    summerCloudColor
  );
}


// =====================================================
// AUTUMN CLOUDS
// =====================================================

function drawAutumnClouds(alphaValue) {
  let autumnCloudColor =
    color(225, 190, 160, alphaValue);

  let autumnShadowColor =
    color(190, 145, 125, alphaValue);


  drawBigCloud2(
    120 + cloudMove,
    150,
    0.80,
    7,
    autumnCloudColor,
    autumnShadowColor
  );

  drawBigCloud6(
    470 + cloudMove,
    240,
    0.72,
    -7,
    autumnCloudColor,
    autumnShadowColor
  );

  drawMediumCloud(
    310,
    95,
    0.42,
    0,
    autumnCloudColor
  );

  drawMediumCloud(
    510,
    410,
    0.38,
    -5,
    autumnCloudColor
  );

  drawSmallCloud(
    130,
    450,
    0.22,
    5,
    autumnCloudColor
  );
}


// =====================================================
// AUTUMN LEAVES
// =====================================================

function drawAutumnLeaves(alphaValue) {
  let y1 =
    (frameCount * 0.50) % 760 - 30;

  let y2 =
    (frameCount * 0.40 + 160) % 760 - 30;

  let y3 =
    (frameCount * 0.60 + 320) % 760 - 30;

  let y4 =
    (frameCount * 0.35 + 480) % 760 - 30;

  let y5 =
    (frameCount * 0.45 + 600) % 760 - 30;

  let y6 =
    (frameCount * 0.55 + 250) % 760 - 30;

  let y7 =
    (frameCount * 0.375 + 420) % 760 - 30;

  let y8 =
    (frameCount * 0.475 + 80) % 760 - 30;


  let sway1 =
    sin(frameCount * 1.0) * 20;

  let sway2 =
    sin(frameCount * 0.85 + 60) * 25;

  let sway3 =
    sin(frameCount * 1.1 + 120) * 18;

  let sway4 =
    sin(frameCount * 0.75 + 180) * 28;

  let sway5 =
    sin(frameCount * 0.95 + 240) * 22;

  let sway6 =
    sin(frameCount * 0.8 + 300) * 20;

  let sway7 =
    sin(frameCount * 1.05 + 100) * 24;

  let sway8 =
    sin(frameCount * 0.9 + 200) * 18;


  drawLeaf(
    80 + sway1,
    y1,
    14,
    frameCount * 1.0,
    color(190, 75, 35, alphaValue)
  );

  drawLeaf(
    170 + sway2,
    y2,
    12,
    frameCount * 0.75,
    color(220, 120, 35, alphaValue)
  );

  drawLeaf(
    260 + sway3,
    y3,
    15,
    frameCount * 1.1,
    color(165, 65, 35, alphaValue)
  );

  drawLeaf(
    350 + sway4,
    y4,
    13,
    frameCount * 0.85,
    color(235, 145, 45, alphaValue)
  );

  drawLeaf(
    450 + sway5,
    y5,
    14,
    frameCount * 1.05,
    color(185, 80, 30, alphaValue)
  );

  drawLeaf(
    540 + sway6,
    y6,
    12,
    frameCount * 0.9,
    color(225, 110, 35, alphaValue)
  );

  drawLeaf(
    210 + sway7,
    y7,
    11,
    frameCount * 1.15,
    color(200, 90, 30, alphaValue)
  );

  drawLeaf(
    410 + sway8,
    y8,
    13,
    frameCount * 0.8,
    color(235, 155, 55, alphaValue)
  );
}


// =====================================================
// ONE AUTUMN LEAF
// =====================================================

function drawLeaf(
  x,
  y,
  leafSize,
  leafAngle,
  leafColor
) {
  push();

  translate(x, y);
  rotate(leafAngle);

  noStroke();
  fill(leafColor);

  ellipse(
    0,
    0,
    leafSize,
    leafSize * 0.55
  );

  triangle(
    leafSize * 0.35,
    0,
    leafSize * 0.65,
    -3,
    leafSize * 0.65,
    3
  );

  pop();
}


// =====================================================
// WINTER CLOUDS
// =====================================================

function drawWinterClouds(alphaValue) {
  let winterCloudColor =
    color(195, 205, 215, alphaValue);

  let winterShadowColor =
    color(150, 165, 180, alphaValue);


  drawBigCloud1(
    90 + cloudMove,
    120,
    1.00,
    5,
    winterCloudColor,
    winterShadowColor
  );

  drawBigCloud2(
    300 + cloudMove,
    170,
    0.95,
    0,
    winterCloudColor,
    winterShadowColor
  );

  drawBigCloud3(
    500 + cloudMove,
    110,
    0.90,
    -6,
    winterCloudColor,
    winterShadowColor
  );

  drawBigCloud6(
    450 + cloudMove,
    330,
    0.80,
    -5,
    winterCloudColor,
    winterShadowColor
  );

  drawMediumCloud(
    150,
    300,
    0.48,
    4,
    winterCloudColor
  );

  drawMediumCloud(
    330,
    420,
    0.42,
    -3,
    winterCloudColor
  );

  drawSmallCloud(
    520,
    500,
    0.25,
    -5,
    winterCloudColor
  );
}


// =====================================================
// SNOW
// =====================================================

function drawSnow(alphaValue) {
  noStroke();

  fill(
    255,
    255,
    255,
    alphaValue
  );

  drawSnowflake(
    50,
    (frameCount * 0.60) % 720,
    6
  );

  drawSnowflake(
    110,
    (frameCount * 0.40 + 120) % 720,
    4
  );

  drawSnowflake(
    170,
    (frameCount * 0.50 + 250) % 720,
    5
  );

  drawSnowflake(
    230,
    (frameCount * 0.70 + 60) % 720,
    4
  );

  drawSnowflake(
    290,
    (frameCount * 0.45 + 380) % 720,
    6
  );

  drawSnowflake(
    350,
    (frameCount * 0.55 + 180) % 720,
    5
  );

  drawSnowflake(
    410,
    (frameCount * 0.375 + 470) % 720,
    4
  );

  drawSnowflake(
    470,
    (frameCount * 0.65 + 300) % 720,
    6
  );

  drawSnowflake(
    530,
    (frameCount * 0.425 + 520) % 720,
    5
  );

  drawSnowflake(
    580,
    (frameCount * 0.575 + 90) % 720,
    4
  );

  drawSnowflake(
    80,
    (frameCount * 0.45 + 400) % 720,
    3
  );

  drawSnowflake(
    145,
    (frameCount * 0.625 + 550) % 720,
    4
  );

  drawSnowflake(
    205,
    (frameCount * 0.35 + 330) % 720,
    3
  );

  drawSnowflake(
    320,
    (frameCount * 0.50 + 620) % 720,
    4
  );

  drawSnowflake(
    390,
    (frameCount * 0.65 + 40) % 720,
    3
  );

  drawSnowflake(
    500,
    (frameCount * 0.475 + 200) % 720,
    4
  );

  drawSnowflake(
    555,
    (frameCount * 0.40 + 350) % 720,
    3
  );
}


// =====================================================
// ONE SNOWFLAKE
// =====================================================

function drawSnowflake(
  x,
  y,
  snowSize
) {
  let snowX =
    x +
    sin(frameCount * 0.75 + x) * 8;

  ellipse(
    snowX,
    y,
    snowSize,
    snowSize
  );
}


// =====================================================
// REFERENCE CLOUD A
// =====================================================

function drawReferenceCloudA(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  push();

  translate(x, y);
  rotate(angle);
  noStroke();

  fill(mainColor);

  ellipse(-92 * s, -2 * s, 88 * s, 34 * s);
  ellipse(-36 * s, -16 * s, 108 * s, 44 * s);
  ellipse(38 * s, -12 * s, 126 * s, 46 * s);
  ellipse(108 * s, -4 * s, 92 * s, 36 * s);
  ellipse(15 * s, 8 * s, 255 * s, 42 * s);

  fill(shadowColor);

  ellipse(-78 * s, 16 * s, 72 * s, 24 * s);
  ellipse(-28 * s, 22 * s, 92 * s, 28 * s);
  ellipse(34 * s, 24 * s, 102 * s, 30 * s);
  ellipse(92 * s, 20 * s, 82 * s, 24 * s);
  ellipse(12 * s, 24 * s, 210 * s, 24 * s);

  pop();
}


// =====================================================
// REFERENCE CLOUD B
// =====================================================

function drawReferenceCloudB(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  push();

  translate(x, y);
  rotate(angle);
  noStroke();

  fill(mainColor);

  ellipse(-100 * s, 0 * s, 80 * s, 30 * s);
  ellipse(-52 * s, -14 * s, 96 * s, 40 * s);
  ellipse(10 * s, -16 * s, 118 * s, 44 * s);
  ellipse(82 * s, -10 * s, 100 * s, 40 * s);
  ellipse(148 * s, -1 * s, 70 * s, 28 * s);
  ellipse(24 * s, 7 * s, 250 * s, 40 * s);

  fill(shadowColor);

  ellipse(-82 * s, 14 * s, 62 * s, 21 * s);
  ellipse(-30 * s, 20 * s, 82 * s, 25 * s);
  ellipse(30 * s, 22 * s, 100 * s, 28 * s);
  ellipse(92 * s, 18 * s, 84 * s, 24 * s);
  ellipse(20 * s, 22 * s, 210 * s, 22 * s);

  pop();
}


// =====================================================
// REFERENCE CLOUD C
// =====================================================

function drawReferenceCloudC(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  push();

  translate(x, y);
  rotate(angle);
  noStroke();

  fill(mainColor);

  ellipse(-84 * s, 2 * s, 72 * s, 26 * s);
  ellipse(-34 * s, -12 * s, 84 * s, 34 * s);
  ellipse(24 * s, -10 * s, 102 * s, 38 * s);
  ellipse(86 * s, -12 * s, 92 * s, 36 * s);
  ellipse(142 * s, -3 * s, 68 * s, 24 * s);
  ellipse(22 * s, 7 * s, 220 * s, 36 * s);

  fill(shadowColor);

  ellipse(-68 * s, 12 * s, 56 * s, 18 * s);
  ellipse(-20 * s, 17 * s, 72 * s, 22 * s);
  ellipse(36 * s, 19 * s, 88 * s, 24 * s);
  ellipse(88 * s, 16 * s, 70 * s, 20 * s);
  ellipse(18 * s, 18 * s, 180 * s, 18 * s);

  pop();
}


// =====================================================
// BIG CLOUD 1
// =====================================================

function drawBigCloud1(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  drawReferenceCloudA(
    x,
    y,
    s,
    angle,
    mainColor,
    shadowColor
  );
}


// =====================================================
// BIG CLOUD 2
// =====================================================

function drawBigCloud2(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  drawReferenceCloudB(
    x,
    y,
    s,
    angle,
    mainColor,
    shadowColor
  );
}


// =====================================================
// BIG CLOUD 3
// =====================================================

function drawBigCloud3(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  drawReferenceCloudC(
    x,
    y,
    s,
    angle,
    mainColor,
    shadowColor
  );
}


// =====================================================
// BIG CLOUD 4
// =====================================================

function drawBigCloud4(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  push();

  translate(x, y);
  rotate(angle);
  noStroke();

  fill(mainColor);

  ellipse(-108 * s, -2 * s, 78 * s, 28 * s);
  ellipse(-58 * s, -16 * s, 98 * s, 38 * s);
  ellipse(6 * s, -18 * s, 130 * s, 48 * s);
  ellipse(80 * s, -12 * s, 104 * s, 40 * s);
  ellipse(148 * s, -2 * s, 74 * s, 28 * s);
  ellipse(24 * s, 8 * s, 260 * s, 44 * s);

  fill(shadowColor);

  ellipse(-84 * s, 14 * s, 62 * s, 20 * s);
  ellipse(-30 * s, 19 * s, 82 * s, 24 * s);
  ellipse(34 * s, 21 * s, 104 * s, 28 * s);
  ellipse(98 * s, 18 * s, 84 * s, 24 * s);
  ellipse(18 * s, 21 * s, 220 * s, 22 * s);

  pop();
}


// =====================================================
// BIG CLOUD 5
// =====================================================

function drawBigCloud5(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  drawReferenceCloudA(
    x,
    y,
    s,
    angle,
    mainColor,
    shadowColor
  );
}


// =====================================================
// BIG CLOUD 6
// =====================================================

function drawBigCloud6(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  drawReferenceCloudC(
    x,
    y,
    s,
    angle,
    mainColor,
    shadowColor
  );
}


// =====================================================
// BIG CLOUD 7
// =====================================================

function drawBigCloud7(
  x,
  y,
  s,
  angle,
  mainColor,
  shadowColor
) {
  push();

  translate(x, y);
  rotate(angle);
  noStroke();

  fill(mainColor);

  ellipse(-86 * s, 2 * s, 68 * s, 24 * s);
  ellipse(-36 * s, -10 * s, 82 * s, 30 * s);
  ellipse(18 * s, -8 * s, 96 * s, 34 * s);
  ellipse(74 * s, -12 * s, 86 * s, 32 * s);
  ellipse(130 * s, -2 * s, 64 * s, 22 * s);
  ellipse(18 * s, 6 * s, 208 * s, 34 * s);

  fill(shadowColor);

  ellipse(-64 * s, 10 * s, 48 * s, 16 * s);
  ellipse(-20 * s, 14 * s, 66 * s, 20 * s);
  ellipse(30 * s, 16 * s, 80 * s, 22 * s);
  ellipse(76 * s, 13 * s, 66 * s, 18 * s);
  ellipse(14 * s, 15 * s, 170 * s, 16 * s);

  pop();
}


// =====================================================
// MEDIUM CLOUD
// =====================================================

function drawMediumCloud(
  x,
  y,
  s,
  angle,
  cloudColor
) {
  push();

  translate(x, y);
  rotate(angle);
  noStroke();
  fill(cloudColor);

  ellipse(-45 * s, 0 * s, 55 * s, 20 * s);
  ellipse(-15 * s, -10 * s, 60 * s, 24 * s);
  ellipse(20 * s, -8 * s, 70 * s, 26 * s);
  ellipse(55 * s, -2 * s, 55 * s, 20 * s);
  ellipse(5 * s, 5 * s, 130 * s, 24 * s);

  pop();
}


// =====================================================
// SMALL CLOUD
// =====================================================

function drawSmallCloud(
  x,
  y,
  s,
  angle,
  cloudColor
) {
  push();

  translate(x, y);
  rotate(angle);
  noStroke();
  fill(cloudColor);

  ellipse(-24 * s, 0, 40 * s, 14 * s);
  ellipse(0, -6 * s, 34 * s, 16 * s);
  ellipse(24 * s, 0 * s, 38 * s, 14 * s);
  ellipse(0, 3 * s, 68 * s, 14 * s);

  pop();
}
