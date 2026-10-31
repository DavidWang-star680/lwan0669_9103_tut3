// woman-figure.js
// SHARED CODE for the whole group (not one person's mechanic):
// the woman's body in Monet's "Woman with a Parasol".
//
// She stands on the hill in front of the sky and the umbrella, and behind the
// meadow, so the grass covers the hem of her dress. Every mechanic can use:
//   drawWoman()      draws her (called once per frame from sketch.js)
//   getWomanHand()   gives the place of her raised hand, where the umbrella
//                    is held. It returns { x, y } in canvas pixels.
//   drawWomanHand()  draws that hand again in front of the umbrella handle.
//
// She is drawn with simple flat shapes (like the clouds and the grass).
// All the numbers in drawWoman() are in "figure units": her feet are at (0, 0),
// and she is about 360 units tall. womanScale() turns units into pixels.
//
// AI note: this file was written with the help of Claude (Anthropic).
// Claude generated the shapes and I (Lizuo Wang) adjusted them.
// "(Week N)" = the Canvas module where the course teaches that technique:
//   push(), pop(), translate(), scale(), fill(), noStroke(), stroke(), line(),
//   strokeWeight(), ellipse(), rect() (Weeks 6, 8, 11); beginShape(), vertex(),
//   endShape() (Week 10); for loops (Week 4); lerp() (Week 11);
//   Math.sin() (Week 5, JavaScript - so it does not depend on angleMode);
//   a function that returns an object { x, y } (Week 4).

// =====================================================================
// 1. WHERE SHE STANDS
// =====================================================================

// How big one figure unit is on the canvas. She is about 43% of the canvas height.
function womanScale() {
  return height / 845;
}

// Where her feet are on the canvas. She stands a little below the top edge of
// the hill (ridgeY() is in perlin-grass.js), so the grass covers her hem.
function womanFeet() {
  let nx = 0.62;                                    // 62% across the canvas
  return { x: nx * width, y: (ridgeY(nx) + 0.045) * height };
}

// Where her raised hand is on the canvas. The umbrella's handle is held here.
function getWomanHand() {
  let feet = womanFeet();
  let k = womanScale();
  return { x: feet.x - 52 * k, y: feet.y - 234 * k };
}

// The hand that holds the umbrella. sketch.js draws it AFTER the umbrella, so
// the fingers close in front of the handle.
function drawWomanHand() {
  let hand = getWomanHand();
  let k = womanScale();
  noStroke();
  fill(248, 217, 188);
  ellipse(hand.x, hand.y, 15 * k, 15 * k);
}

// =====================================================================
// 2. DRAWING HER
// =====================================================================
function drawWoman() {
  let feet = womanFeet();

  // colours, each as [red, green, blue]
  let dress = [238, 242, 252];
  let dressShadow = [201, 211, 236];
  let jacket = [250, 244, 222];
  let jacketShadow = [230, 222, 192];
  let skin = [248, 217, 188];
  let hair = [74, 53, 53];
  let blue = [127, 183, 216];                       // sash, scarf and hair ribbon

  push();
  translate(feet.x, feet.y);                        // (0, 0) is now between her feet
  scale(womanScale());                              // from here on we draw in figure units
  noStroke();

  // ---- scarf blown to the right (behind the head) ----
  fill(blue);
  beginShape();
  vertex(4, -300);
  vertex(20, -306);
  vertex(62, -322);
  vertex(100, -314);
  vertex(64, -304);
  vertex(32, -290);
  vertex(6, -288);
  endShape();

  // ---- long dress, blown to the right ----
  fill(dress);
  beginShape();
  vertex(-26, -196);
  vertex(-34, -150);
  vertex(-52, -100);
  vertex(-72, -50);
  vertex(-96, -8);
  // wavy hem from left to right
  for (let i = 0; i <= 8; i++) {
    let hemX = lerp(-96, 122, i / 8);
    let hemY = -4 + Math.sin(i * 1.6) * 7;
    vertex(hemX, hemY);
  }
  vertex(128, -14);
  vertex(100, -70);
  vertex(70, -120);
  vertex(44, -165);
  vertex(26, -196);
  endShape();

  // shaded left side of the dress
  fill(dressShadow);
  beginShape();
  vertex(-26, -196);
  vertex(-34, -150);
  vertex(-52, -100);
  vertex(-72, -50);
  vertex(-96, -8);
  vertex(-40, -2);
  vertex(-12, -100);
  vertex(-8, -196);
  endShape();

  // a few folds in the dress
  stroke(dressShadow[0], dressShadow[1], dressShadow[2]);
  strokeWeight(2.5);
  line(6, -190, 34, -8);
  line(16, -175, 78, -14);
  line(-18, -190, -50, -20);
  noStroke();

  // ---- blue sash at the waist ----
  fill(blue);
  rect(-27, -204, 54, 10, 3);

  // ---- jacket ----
  fill(jacket);
  beginShape();
  vertex(-28, -290);
  vertex(28, -290);
  vertex(32, -250);
  vertex(26, -196);
  vertex(-26, -196);
  vertex(-30, -250);
  endShape();
  fill(jacketShadow);
  beginShape();
  vertex(-28, -290);
  vertex(-14, -290);
  vertex(-16, -196);
  vertex(-26, -196);
  vertex(-30, -250);
  endShape();

  // ---- arms (thick lines with round ends) ----
  stroke(jacket[0], jacket[1], jacket[2]);
  strokeWeight(13);
  line(-22, -284, -54, -262);                       // raised arm: shoulder to elbow
  line(-54, -262, -52, -238);                       // elbow to hand
  strokeWeight(12);
  line(24, -284, 34, -240);                         // other arm
  line(34, -240, 30, -204);
  noStroke();

  // ---- hands ----
  fill(skin);
  ellipse(30, -198, 11, 11);                        // (the hand that holds the umbrella is drawn by drawWomanHand())

  // ---- neck ----
  rect(-5.5, -312, 11, 24, 5);

  // ---- hair behind the head, and the ponytail blowing to the right ----
  fill(hair);
  ellipse(-1, -336, 41, 43);
  beginShape();
  vertex(14, -342);
  vertex(58, -356);
  vertex(94, -342);
  vertex(60, -334);
  vertex(18, -326);
  endShape();

  // ---- head ----
  fill(skin);
  ellipse(0, -330, 34, 38);

  // ---- fringe over the forehead and the blue ribbon ----
  fill(hair);
  beginShape();
  vertex(-18, -336);
  vertex(-14, -352);
  vertex(0, -357);
  vertex(14, -352);
  vertex(18, -336);
  vertex(10, -343);
  vertex(0, -346);
  vertex(-10, -343);
  endShape();
  fill(blue);
  rect(-17, -345, 34, 4, 2);

  // ---- face ----
  fill(60, 44, 44);
  ellipse(-6, -331, 3.5, 4.5);                      // eyes
  ellipse(6, -331, 3.5, 4.5);
  fill(242, 167, 154, 150);
  ellipse(-10, -322, 8, 4.5);                       // cheeks
  ellipse(10, -322, 8, 4.5);
  stroke(201, 115, 93);
  strokeWeight(1.2);
  line(-3, -319, 3, -319);                          // small smile
  noStroke();

  pop();
}
