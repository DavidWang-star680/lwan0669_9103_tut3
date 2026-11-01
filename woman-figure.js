// woman-figure.js
// Draws the woman in profile (looking left), in flat Ghibli-style shapes.
// (The little boy of the reference picture is left out.)
// Everything is drawn in picture units (1041 x 1511, see sketch.js).
// Perlin noise makes her hat ribbon flutter and her skirt hem move a little.
//
// Techniques ("(Week N)" = the Canvas module where it is taught):
//   beginShape(), vertex(), endShape(), ellipse(), fill()      (Week 6)
//   arrays of points [[x, y], ...]                             (Week 3)
//   for loops                                                  (Week 4)
//   push(), pop(), translate(), rotate()                       (Week 8)
//   noise()                                                    (Week 8)
//   lerp()                                                     (Week 11)
//   AI note: written with the help of Claude (Anthropic).

// Where her hand is, where the umbrella pole is held, in CANVAS PIXELS
// (the umbrella file works in pixels; the woman is drawn in picture units, so we multiply by k).
function getWomanHand() {
  return { x: 566 * k, y: 588 * k };                // an object { x, y }: Week 3
}

// Draws a smooth closed shape through a list of points. Each point pulls the
// outline towards it, and the curve between the middles of the edges is made
// with lerp() (so no new drawing function is needed).
function softShape(points, colour, offsetX, offsetY) {
  fill(colour[0], colour[1], colour[2]);
  let n = points.length;
  beginShape();
  for (let i = 0; i < n; i++) {
    let prev = points[(i + n - 1) % n];
    let cur = points[i];
    let next = points[(i + 1) % n];
    let x0 = (prev[0] + cur[0]) / 2 + offsetX;
    let y0 = (prev[1] + cur[1]) / 2 + offsetY;
    let x1 = (cur[0] + next[0]) / 2 + offsetX;
    let y1 = (cur[1] + next[1]) / 2 + offsetY;
    for (let s = 0; s <= 10; s++) {
      let t = s / 10;
      let ax = lerp(x0, cur[0] + offsetX, t);
      let ay = lerp(y0, cur[1] + offsetY, t);
      let bx = lerp(cur[0] + offsetX, x1, t);
      let by = lerp(cur[1] + offsetY, y1, t);
      vertex(lerp(ax, bx, t), lerp(ay, by, t));
    }
  }
  endShape(CLOSE);
}

// A small flutter for point number i: a smooth random offset from noise().
function flutter(i, amount, speed) {
  return (noise(i * 3.7, frameCount * speed) - 0.5) * amount;
}

function drawWoman() {
  noStroke();

  // ---------- the skirt ----------
  // the hem points move a little with noise()
  let skirt = [
    [570, 690], [538, 760], [484, 860], [428, 960], [372, 1044],
    [430 + flutter(1, 10, 0.01), 1090 + flutter(2, 14, 0.012)],
    [540, 1112 + flutter(3, 14, 0.012)],
    [660, 1118 + flutter(4, 14, 0.012)],
    [780, 1112 + flutter(5, 14, 0.012)],
    [880 + flutter(6, 10, 0.01), 1094 + flutter(7, 14, 0.012)],
    [886, 1040], [860, 940], [836, 850], [802, 770], [768, 712], [745, 690]
  ];
  softShape(skirt, [247, 245, 233], 12, -4);        // the cream edge on the right
  softShape(skirt, [166, 188, 236], 0, 0);          // the blue of the skirt
  softShape([[600, 700], [586, 780], [542, 880], [502, 960], [470, 1040], [522, 1062], [562, 960], [612, 860], [650, 760], [662, 702]],
    [208, 221, 247], 0, 0);                         // light folds
  softShape([[690, 722], [702, 800], [692, 900], [672, 1000], [664, 1102], [722, 1106], [742, 1000], [762, 900], [762, 800], [742, 722]],
    [130, 153, 215], 0, 0);                         // dark folds
  softShape([[780, 772], [816, 860], [838, 950], [850, 1040], [860, 1086], [882, 1070], [874, 990], [862, 900], [832, 812]],
    [200, 215, 245], 0, 0);
  softShape([[456, 982], [480, 1050], [540, 1100], [604, 1108], [562, 1050], [512, 990]],
    [152, 174, 228], 0, 0);

  // ---------- the jacket ----------
  softShape([[548, 702], [600, 688], [700, 690], [772, 700], [792, 726], [700, 742], [600, 736], [548, 722]],
    [242, 240, 218], 0, 0);                         // the flare at the waist
  softShape([[690, 470], [736, 522], [750, 600], [754, 702], [640, 722]],
    [204, 213, 236], 0, 0);                         // the back, in shadow
  softShape([[614, 478], [690, 470], [726, 540], [742, 620], [760, 706], [700, 724], [600, 716], [560, 702], [568, 620], [576, 560], [598, 500]],
    [243, 241, 218], 0, 0);                         // the front, lit
  softShape([[690, 482], [728, 546], [744, 626], [760, 706], [706, 722], [694, 612], [682, 540]],
    [214, 222, 240], 0, 0);                         // blue shadow on the right
  // the arm that holds the umbrella
  softShape([[640, 498], [690, 524], [676, 574], [622, 612], [586, 628], [558, 602], [574, 562], [610, 522]],
    [242, 240, 220], 0, 0);
  softShape([[558, 602], [586, 630], [624, 614], [678, 576], [692, 532], [666, 570], [620, 600], [580, 606]],
    [196, 208, 234], 0, 0);                         // the shadow under the arm
  softShape([[556, 598], [572, 584], [598, 588], [600, 614], [578, 630], [558, 616]],
    [214, 224, 242], 0, 0);                         // the cuff

  // ---------- neck, head and hair ----------
  softShape([[618, 438], [656, 438], [662, 490], [620, 494]], [226, 178, 142], 0, 0);   // neck
  fill(128, 92, 62);
  ellipse(676, 408, 104, 108);                      // hair at the back of the head
  ellipse(716, 430, 62, 56);                        // the bun
  softShape([[596, 410], [610, 384], [640, 376], [664, 396], [666, 432], [650, 462], [620, 468], [602, 454], [588, 434]],
    [238, 194, 158], 0, 0);                         // the face
  softShape([[596, 400], [612, 378], [640, 372], [666, 394], [662, 404], [636, 394], [610, 408]],
    [214, 164, 132], 0, 0);                         // the shadow of the hat on her face
  fill(110, 78, 52);
  softShape([[600, 396], [622, 372], [668, 374], [676, 414], [650, 398], [624, 400]], [110, 78, 52], 0, 0);   // hair at the front
  fill(60, 42, 42);
  ellipse(610, 418, 7, 11);                         // her eye
  fill(236, 160, 140, 120);
  ellipse(622, 436, 18, 12);                        // a soft blush
  // collar and blue bow
  softShape([[610, 486], [652, 484], [662, 502], [632, 514], [606, 506]], [248, 246, 232], 0, 0);
  fill(46, 90, 168);
  triangle(619, 500, 590, 486, 592, 518);
  triangle(619, 500, 650, 488, 652, 518);
  ellipse(620, 500, 16, 16);

  // ---------- the hat ----------
  push();
  translate(664, 352);
  rotate(-7);                                       // the hat is a little tilted (degrees)
  fill(214, 186, 128);
  ellipse(0, 6, 200, 72);                           // the underside of the brim
  fill(234, 212, 162);
  ellipse(0, 0, 196, 64);                           // the brim
  pop();
  softShape([[610, 352], [612, 326], [640, 312], [690, 312], [718, 326], [722, 352], [668, 358]], [248, 234, 192], 0, 0);   // the crown
  softShape([[611, 349], [722, 349], [724, 332], [610, 335]], [50, 98, 172], 0, 0);   // the blue band

  // ---------- the ribbon that flutters behind her hat ----------
  let ribbon = [
    [716, 342], [758, 358 + flutter(10, 24, 0.02)], [806 + flutter(11, 30, 0.02), 398 + flutter(12, 30, 0.02)],
    [834 + flutter(13, 30, 0.02), 420 + flutter(14, 30, 0.02)], [800 + flutter(15, 24, 0.02), 442 + flutter(16, 24, 0.02)],
    [760, 452 + flutter(17, 20, 0.02)], [726, 430], [740, 400], [722, 368]
  ];
  softShape(ribbon, [150, 186, 236], 0, 0);
  softShape([[726, 352], [770, 372], [806, 402], [780, 410], [740, 392]], [236, 240, 244], 0, 0);
}

// Her hand, drawn after the umbrella so that it holds the pole.
function drawWomanHand() {
  noStroke();
  fill(238, 192, 154);
  ellipse(566, 576, 32, 36);
  ellipse(568, 606, 30, 32);
  fill(226, 176, 138);
  ellipse(558, 568, 12, 14);
  ellipse(559, 582, 12, 14);
}
