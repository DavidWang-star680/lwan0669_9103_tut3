// woman-figure.js
// SHARED CODE for the whole group (not one person's mechanic):
// the woman's body in Monet's "Woman with a Parasol", drawn in a soft
// anime / Ghibli-like style (straw hat with a blue ribbon, white dress with
// long sleeves, a blue sash and a long skirt blowing to the right).
//
// She stands on the hill in front of the sky and behind the meadow, so the
// grass covers the hem of her skirt. The rest of the project uses:
//   drawWoman()      draws her (called once per frame from sketch.js)
//   getWomanHand()   gives the place of her raised hand, where the umbrella
//                    is held. It returns { x, y } in canvas pixels.
//   drawWomanHand()  draws that hand again in front of the umbrella handle.
//
// All the numbers in drawWoman() are in "figure units": her feet are at
// (0, 0), up is negative, and she is about 390 units tall (with the hat).
// womanScale() turns figure units into canvas pixels.
//
// AI note: this file was written with the help of Claude (Anthropic).
// Claude generated the shapes from a reference picture and I (Lizuo Wang)
// adjusted them.
//
// Only techniques taught in IDEA9103 are used. "(Week N)" = the Canvas module
// where the course teaches that technique:
//   push(), pop(), translate(), scale(), rotate(), angleMode(DEGREES) (Weeks 8, 11)
//   fill(), noFill(), stroke(), noStroke(), strokeWeight() (Week 6)
//   ellipse(), rect(), line(), triangle(), arc() (Weeks 6, 8, 11)
//   beginShape(), vertex(), endShape() (Week 10)
//   for loops, functions with parameters, arrays (Weeks 3, 4)
//   lerp() (Week 11); Math.sin() (Week 5, JavaScript)
//   a function that returns an object { x, y } (Week 4)
// rotate() and arc() use degrees: sketch.js calls angleMode(DEGREES).

// =====================================================================
// 1. WHERE SHE STANDS
// =====================================================================

// How big one figure unit is on the canvas. She is about 46% of the canvas height.
function womanScale() {
  return height / 845;
}

// Where her feet are on the canvas. She stands just below the top edge of the
// hill (ridgeY() is in perlin-grass.js), so the grass covers her hem.
function womanFeet() {
  let nx = 0.62;                                    // 62% across the canvas
  return { x: nx * width, y: (ridgeY(nx) + 0.02) * height };
}

// Where her raised hand is on the canvas. The umbrella's handle is held here.
function getWomanHand() {
  let feet = womanFeet();
  let k = womanScale();
  return { x: feet.x - 60 * k, y: feet.y - 272 * k };
}

// The hand that holds the umbrella. sketch.js draws it AFTER the umbrella, so
// the fingers close in front of the handle.
function drawWomanHand() {
  let hand = getWomanHand();
  push();
  translate(hand.x, hand.y);
  scale(womanScale());
  noStroke();
  fill(241, 205, 176);                              // the back of the hand
  ellipse(0, 0, 19, 17);
  fill(250, 223, 197);                              // four fingers closed round the handle
  ellipse(6, -6, 11, 5.5);
  ellipse(7, -1, 11, 5.5);
  ellipse(6, 4, 11, 5.5);
  ellipse(4, 8, 9, 5);
  fill(255, 232, 208);                              // the thumb
  ellipse(-4, -3, 6, 10);
  pop();
}

// =====================================================================
// 2. SMALL HELPERS
// =====================================================================

// Adds the points of a smooth curve to the shape that is being drawn with
// beginShape(). The curve goes from (x0, y0) to (x1, y1) and bends towards the
// control point (cx, cy). lerp() is used twice, so no new function is needed
// (lerp: Week 11, for loop: Week 4).
function curveVerts(x0, y0, cx, cy, x1, y1) {
  for (let i = 1; i <= 12; i++) {
    let t = i / 12;
    let ax = lerp(x0, cx, t);
    let ay = lerp(y0, cy, t);
    let bx = lerp(cx, x1, t);
    let by = lerp(cy, y1, t);
    vertex(lerp(ax, bx, t), lerp(ay, by, t));
  }
}

// x and y of the wavy hem of the skirt, for t from 0 (left end) to 1 (right end).
function hemX(t) {
  return lerp(-104, 178, t);
}
function hemY(t) {
  return lerp(-4, -16, t) + Math.sin(t * 22) * 5;
}

// =====================================================================
// 3. DRAWING HER
// =====================================================================
function drawWoman() {
  // colours, each as [red, green, blue]
  let cloth = [244, 242, 233];                      // lit white cloth
  let clothShade = [208, 216, 230];                 // blue-grey shadow on the cloth
  let clothDeep = [176, 191, 214];                  // the darkest shadow (under the skirt)
  let fold = [219, 225, 236];                       // thin fold lines
  let blue = [48, 82, 172];                         // sash and hat ribbon
  let blueDark = [36, 62, 142];
  let skin = [250, 224, 198];
  let skinShade = [236, 196, 168];
  let hair = [88, 58, 46];
  let hairLight = [128, 90, 68];
  let straw = [236, 208, 152];
  let strawShade = [206, 174, 114];

  push();
  translate(womanFeet().x, womanFeet().y);          // (0, 0) is now between her feet
  scale(womanScale());                              // from here on we draw in figure units
  noStroke();

  // ---------- hair at the back, blowing a little to the right ----------
  fill(hair);
  ellipse(-6, -332, 52, 56);
  beginShape();                                     // the wavy lock at the back
  vertex(14, -346);
  vertex(34, -338);
  vertex(52, -318);
  vertex(46, -300);
  vertex(38, -310);
  vertex(34, -296);
  vertex(24, -314);
  vertex(14, -318);
  endShape();

  // ---------- the long skirt ----------
  fill(cloth);                                      // 1) the whole skirt, lit
  beginShape();
  vertex(-30, -192);
  curveVerts(-30, -192, -64, -100, hemX(0), hemY(0));
  for (let i = 1; i <= 30; i++) {                   // wavy hem, from left to right
    vertex(hemX(i / 30), hemY(i / 30));
  }
  curveVerts(hemX(1), hemY(1), 118, -112, 36, -192);
  endShape();

  fill(clothShade);                                 // 2) shadow on the right side
  beginShape();
  vertex(36, -192);
  curveVerts(36, -192, 118, -112, hemX(1), hemY(1));
  for (let i = 30; i >= 18; i--) {
    vertex(hemX(i / 30), hemY(i / 30));
  }
  curveVerts(hemX(0.6), hemY(0.6), 38, -100, 8, -192);
  endShape();

  fill(clothDeep);                                  // 3) the underside of the blowing hem
  beginShape();
  for (let i = 22; i <= 30; i++) {
    vertex(hemX(i / 30), hemY(i / 30));
  }
  curveVerts(hemX(1), hemY(1), 150, -50, hemX(22 / 30), hemY(22 / 30) - 4);
  endShape();

  noFill();                                         // 4) soft fold lines
  stroke(fold[0], fold[1], fold[2]);
  strokeWeight(2.4);
  beginShape();
  vertex(-8, -190);
  curveVerts(-8, -190, -24, -100, -50, -12);
  endShape();
  beginShape();
  vertex(8, -188);
  curveVerts(8, -188, 18, -100, 8, -10);
  endShape();
  beginShape();
  vertex(22, -188);
  curveVerts(22, -188, 64, -104, 84, -14);
  endShape();
  beginShape();
  vertex(32, -188);
  curveVerts(32, -188, 96, -112, 142, -16);
  endShape();
  stroke(255, 255, 250);                            // bright folds on the lit left side
  strokeWeight(1.8);
  beginShape();
  vertex(-18, -186);
  curveVerts(-18, -186, -36, -100, -74, -18);
  endShape();
  noStroke();

  // ---------- right arm (behind the body), hanging down ----------
  stroke(clothShade[0], clothShade[1], clothShade[2]);
  strokeWeight(21);
  line(26, -286, 38, -240);                         // upper arm
  stroke(cloth[0], cloth[1], cloth[2]);
  strokeWeight(19);
  line(38, -240, 33, -208);                         // forearm
  noStroke();
  fill(skin);
  ellipse(33, -199, 11, 12);                        // hand
  fill(clothShade);
  ellipse(34, -208, 17, 6);                         // cuff

  // ---------- the top of the dress ----------
  fill(cloth);
  beginShape();
  vertex(-28, -292);
  vertex(28, -292);
  curveVerts(28, -292, 36, -246, 26, -194);
  vertex(-26, -194);
  curveVerts(-26, -194, -34, -246, -28, -292);
  endShape();
  fill(clothShade);                                 // shadow on the right side of the top
  beginShape();
  vertex(10, -292);
  vertex(28, -292);
  curveVerts(28, -292, 36, -246, 26, -194);
  vertex(12, -194);
  curveVerts(12, -194, 18, -246, 10, -292);
  endShape();

  // the blue sash, with a knot and two tails blowing to the right
  fill(blue);
  beginShape();
  vertex(-28, -206);
  vertex(28, -208);
  vertex(27, -194);
  vertex(-27, -192);
  endShape();
  fill(blueDark);
  beginShape();                                     // tails
  vertex(22, -202);
  vertex(56, -212);
  curveVerts(56, -212, 72, -200, 92, -194);
  vertex(66, -190);
  vertex(76, -176);
  curveVerts(76, -176, 52, -184, 24, -196);
  endShape();
  fill(blue);
  ellipse(24, -201, 14, 14);                        // the knot

  // ---------- neck and high collar ----------
  fill(skin);
  rect(-10, -314, 13, 24, 5);
  fill(skinShade);                                  // shadow under the chin
  ellipse(-3, -308, 15, 7);
  fill(cloth);
  beginShape();                                     // stand-up collar
  vertex(-15, -304);
  vertex(9, -304);
  vertex(12, -290);
  vertex(-17, -290);
  endShape();
  fill(clothShade);
  triangle(-3, -290, 3, -304, 12, -290);
  fill(255, 255, 250);
  ellipse(-3, -288, 3, 3);                          // a button

  // ---------- left arm (the one that holds the umbrella) ----------
  stroke(clothShade[0], clothShade[1], clothShade[2]);
  strokeWeight(27);                                 // puffy upper sleeve, in shadow
  line(-25, -283, -58, -228);
  stroke(cloth[0], cloth[1], cloth[2]);
  strokeWeight(25);
  line(-26, -285, -58, -231);
  stroke(clothShade[0], clothShade[1], clothShade[2]);
  strokeWeight(20);                                 // forearm sleeve, going up to the hand
  line(-57, -228, -62, -261);
  stroke(cloth[0], cloth[1], cloth[2]);
  strokeWeight(18);
  line(-58, -230, -62, -262);
  noStroke();
  fill(255, 255, 250, 150);
  ellipse(-38, -270, 8, 18);                        // light on the shoulder
  fill(clothShade);                                 // cuff at the wrist
  ellipse(-62, -263, 20, 7);
  fill(skin);
  rect(-67, -272, 10, 10, 3);                       // wrist

  // ---------- head ----------
  fill(skin);
  ellipse(-4, -328, 38, 45);                        // face
  fill(skinShade);
  ellipse(8, -318, 14, 22);                         // soft shadow on the right cheek
  fill(skin);
  ellipse(-5, -328, 35, 44);                        // lit face over the shadow

  // ears are hidden by the hair; now the face
  fill(255, 170, 160, 120);
  ellipse(-14, -318, 9, 5);                         // cheeks
  ellipse(6, -318, 8, 5);
  fill(50, 36, 34);                                 // eyes: big and dark
  ellipse(-12, -328, 6.5, 9);
  ellipse(3, -328, 5.5, 9);
  fill(255);                                        // eye highlights
  ellipse(-11, -330, 2.4, 2.8);
  ellipse(4, -330, 2, 2.6);
  noFill();
  stroke(60, 40, 36);
  strokeWeight(1.6);
  arc(-12, -329, 9, 9, 200, 340);                   // upper eyelid
  arc(3, -329, 8, 9, 200, 340);
  strokeWeight(1.2);
  line(-17, -338, -8, -339);                        // eyebrows
  line(0, -339, 8, -338);
  stroke(222, 168, 140);
  strokeWeight(1.2);
  line(-5, -322, -4, -319);                         // nose
  stroke(194, 100, 90);
  strokeWeight(1.6);
  arc(-5, -314, 11, 7, 15, 165);                    // a small smile
  noStroke();

  // ---------- hair in front of the face ----------
  fill(hair);
  beginShape();                                     // side-swept fringe
  vertex(-26, -344);
  vertex(-24, -326);
  vertex(-19, -336);
  vertex(-10, -342);
  vertex(2, -338);
  vertex(14, -342);
  vertex(16, -352);
  vertex(-10, -358);
  endShape();
  beginShape();                                     // lock at the left of the face
  vertex(-26, -340);
  vertex(-24, -308);
  vertex(-18, -300);
  vertex(-18, -316);
  vertex(-20, -332);
  endShape();
  beginShape();                                     // lock at the right of the face
  vertex(14, -344);
  vertex(18, -322);
  vertex(14, -308);
  vertex(8, -318);
  vertex(10, -334);
  endShape();
  stroke(hairLight[0], hairLight[1], hairLight[2]); // light strands
  strokeWeight(1.6);
  line(-20, -346, -14, -336);
  line(-8, -349, -2, -340);
  line(4, -347, 8, -340);
  line(-23, -326, -20, -312);
  line(30, -334, 42, -318);
  noStroke();

  // ---------- straw hat with a blue ribbon ----------
  push();
  translate(-5, -349);
  rotate(-9);                                       // the hat is tipped a little
  fill(strawShade);                                 // underside of the brim
  ellipse(0, 3, 116, 24);
  fill(straw);                                      // brim
  ellipse(0, 0, 116, 22);
  noFill();
  stroke(strawShade[0], strawShade[1], strawShade[2]);
  strokeWeight(1);
  ellipse(0, 0, 100, 17);                           // lines of straw
  ellipse(0, 0, 80, 12);
  noStroke();
  fill(straw);                                      // crown
  ellipse(0, -13, 60, 42);
  fill(255, 238, 196);                              // light on the crown
  ellipse(-10, -20, 22, 14);
  fill(blue);                                       // ribbon round the crown
  beginShape();
  vertex(-30, -6);
  curveVerts(-30, -6, 0, 3, 30, -7);
  vertex(30, -15);
  curveVerts(30, -15, 0, -6, -30, -14);
  endShape();
  fill(blueDark);                                   // tails of the ribbon blowing to the right
  beginShape();
  vertex(28, -12);
  vertex(52, -26);
  curveVerts(52, -26, 66, -22, 84, -10);
  vertex(62, -10);
  vertex(80, 8);
  curveVerts(80, 8, 52, 0, 28, -8);
  endShape();
  fill(blue);
  ellipse(29, -11, 12, 12);                         // the knot
  pop();

  pop();
}
