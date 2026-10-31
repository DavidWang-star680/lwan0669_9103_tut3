// =====================================================
// TIME-BASED MECHANIC: FOUR-SEASON SKY
// Developed by Fei Jiang
// =====================================================

// This mechanic creates a repeating four-season sky
// using time-based animation in p5.js.

// Group integration:
// setup() and createCanvas() are handled in sketch.js,
// allowing all mechanics to share one canvas.
// drawSky() is called from the main sketch.js.

// This sky mechanic draws its own seasonal clouds using
// drawSpringClouds(), drawSummerClouds(), drawAutumnClouds(), and
// drawWinterClouds(). It does not need another group's Perlin cloud file.

// drawGradientSky() uses strokeWeight(1) to prevent
// changes from other mechanics affecting the sky.

// AI Acknowledgement (ChatGPT, OpenAI):
// ChatGPT assisted with developing and refining
// seasonal timing, colour transitions, fade effects,
// and moving elements such as the sun, leaves and snow.
// The code was adjusted through several iterations.
// Key AI-assisted sections are explained below.

let cloudMove = 0;

// Called every frame from sketch.js. Draws the sky, the sun, the clouds and
// the falling leaves / snow for the current moment of the 1500-frame season cycle.
// ChatGPT-assisted timing: frameCount tracks elapsed animation frames.
// The remainder operator (%) restarts the 1500-frame cycle (about 25 seconds
// at 60 frames per second); if/else checks select the current season.
// cloudMove controls the horizontal movement of this mechanic's own clouds.
function drawSky() {
  cloudMove = sin(frameCount * 0.4) * 20;
 let seasonFrame = (millis() * 0.06) % 1500;

  // Draw a seasonal sky first, then this mechanic's original clouds.
  // Autumn leaves and winter snow are drawn only in their relevant seasons.
  if (seasonFrame < 225) {
    drawSpringSky();
    drawMyClouds(seasonFrame);

  } else if (seasonFrame < 375) {
    // ChatGPT-assisted transition: amount moves from 0 to 1 across 150 frames.
    // lerp() increases the sun opacity as the spring sky changes to summer.
    // The clouds crossfade between spring and summer.
    let amount = (seasonFrame - 225) / 150;

    drawSkyTransition(
      color(55, 125, 190),
      color(145, 195, 225),
      color(65, 150, 220),
      color(170, 225, 245),
      amount
    );

    let sunAlpha = lerp(0, 255, amount);
    drawMovingSun(seasonFrame, sunAlpha);

    drawMyClouds(seasonFrame);

  } else if (seasonFrame < 600) {
    drawSummerSky();
    drawMovingSun(seasonFrame, 255);
    drawMyClouds(seasonFrame);

  } else if (seasonFrame < 750) {
    // Reverse the sun fade and bring in autumn leaves while the sky warms.
    let amount = (seasonFrame - 600) / 150;

    drawSkyTransition(
      color(65, 150, 220),
      color(170, 225, 245),
      color(185, 105, 55),
      color(245, 190, 115),
      amount
    );

    let sunAlpha = lerp(255, 0, amount);
    drawMovingSun(seasonFrame, sunAlpha);

    drawMyClouds(seasonFrame);

    let autumnAlpha = lerp(0, 255, amount);
    drawAutumnLeaves(autumnAlpha);

  } else if (seasonFrame < 915) {
    drawAutumnSky();
    drawMyClouds(seasonFrame);
    drawAutumnLeaves(255);

  } else if (seasonFrame < 1125) {
    // ChatGPT-assisted smoothstep: easing slows down the start and end of
    // the autumn-to-winter transition. The same value controls colour and
    // the leaf/snow opacity fades, so they change together.
    let amount = (seasonFrame - 915) / 210;
    let smoothAmount = amount * amount * (3 - 2 * amount);

    drawSkyTransition(
      color(185, 105, 55),
      color(245, 190, 115),
      color(90, 115, 145),
      color(180, 195, 210),
      smoothAmount
    );

    drawMyClouds(seasonFrame);

    let autumnAlpha = lerp(255, 0, smoothAmount);
    drawAutumnLeaves(autumnAlpha);

    let winterAlpha = lerp(0, 255, smoothAmount);
    drawSnow(winterAlpha);

  } else if (seasonFrame < 1290) {
    drawWinterSky();
    drawMyClouds(seasonFrame);
    drawSnow(255);

  } else {
    // Winter gradually returns to spring using the same smoothstep easing.
    // Snow fades away while the sky colour changes back to spring blue.
    let amount = (seasonFrame - 1290) / 210;
    let smoothAmount = amount * amount * (3 - 2 * amount);

    drawSkyTransition(
      color(90, 115, 145),
      color(180, 195, 210),
      color(55, 125, 190),
      color(145, 195, 225),
      smoothAmount
    );

    drawMyClouds(seasonFrame);

    let winterAlpha = lerp(255, 0, smoothAmount);
    drawSnow(winterAlpha);
  }
}


// =====================================================
// GRADIENT SKY
// =====================================================

// Draw a vertical gradient with a for loop: each horizontal line gets a
// colour between topColor and bottomColor using p5.js lerpColor().
// ChatGPT assisted with the gradient implementation. strokeWeight(1) also
// resets the stroke after other group mechanics modify its thickness.
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

// ChatGPT-assisted colour interpolation: blend both the top and bottom
// sky colours between seasons, then redraw the vertical gradient.
// amount=0 shows the old palette; amount=1 shows the new palette.
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

// Each season uses its own top/bottom RGB colours. The same gradient
// function is reused so the sky stays consistent across the animation.
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
// MOVING SUN
// =====================================================

// ChatGPT-assisted sun animation: map() converts the season frame to a
// 0-1 progress value; constrain() keeps it in that range. lerp() moves
// the sun left to right, while sin() creates an arc across the sky.
// Three translucent ellipses draw the soft glow and bright centre.
// sin() here assumes the shared setup uses angleMode(DEGREES).
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

// This mechanic's original p5.js cloud layouts are now used directly.
// During seasonal transitions, old clouds fade out as new clouds fade in.
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

// ChatGPT-assisted leaf animation: frameCount controls falling speed,
// % wraps each leaf back to the top, and sin() creates side-to-side sway.
// Different offsets and multipliers give the leaves varied movement.
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

// Draw one leaf from an ellipse and triangle (basic p5.js shapes).
// push()/pop() isolate translate() and rotate(), so the next leaf is not
// affected by this leaf's position or rotation.
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

// ChatGPT-assisted snowfall: each snowflake has a different vertical
// speed and starting offset. The % operator repeats its fall down the sky.
// alphaValue controls the fade during seasonal transitions.
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

// Use sin() to add a small horizontal drift as each flake falls;
// ellipse() draws an individual snowflake.
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

// Reusable cloud-shape helpers: overlapping ellipses form a soft cloud,
// and the second set of ellipses creates its lower shadow. The same shapes
// can be reused at different coordinates, sizes and angles.
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

// Basic p5.js drawing techniques: translate(), rotate(), fill() and
// ellipse() build reusable medium and small cloud shapes.
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

// =====================================================
// SEASONAL CLOUD LAYOUT CONTROL — FEI'S ORIGINAL CLOUDS
// =====================================================

// AI-assisted (ChatGPT): crossfade between the original seasonal clouds
// during the same season transition intervals as the sky colour.
// The four cloud layout functions below belong to this sky mechanic;
// no Perlin cloud function from another file is required.
function drawMyClouds(seasonFrame) {
  if (seasonFrame < 225) {
    drawSpringClouds(255);
  } else if (seasonFrame < 375) {
    let amount = (seasonFrame - 225) / 150;
    drawSpringClouds(255 * (1 - amount));
    drawSummerClouds(255 * amount);
  } else if (seasonFrame < 600) {
    drawSummerClouds(255);
  } else if (seasonFrame < 750) {
    let amount = (seasonFrame - 600) / 150;
    drawSummerClouds(255 * (1 - amount));
    drawAutumnClouds(255 * amount);
  } else if (seasonFrame < 915) {
    drawAutumnClouds(255);
  } else if (seasonFrame < 1125) {
    let amount = (seasonFrame - 915) / 210;
    let smoothAmount = amount * amount * (3 - 2 * amount);
    drawAutumnClouds(255 * (1 - smoothAmount));
    drawWinterClouds(255 * smoothAmount);
  } else if (seasonFrame < 1290) {
    drawWinterClouds(255);
  } else {
    let amount = (seasonFrame - 1290) / 210;
    let smoothAmount = amount * amount * (3 - 2 * amount);
    drawWinterClouds(255 * (1 - smoothAmount));
    drawSpringClouds(255 * smoothAmount);
  }
}