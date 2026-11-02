// sketch.js
// Main file: owns the canvas and runs the user-input mechanic.
// The umbrella opens / closes when clicked and sways towards the mouse.
// Both changes are eased with lerp(), so nothing jumps between states.
//
// AI note: written with the help of Claude (Anthropic).
// "(Week N)" = the Canvas module where the course teaches that technique.
//
// ITERATIONS
//   - Thinner handle: the handle rectangle is now 12 pixels wide instead of
//     18 (rect(-9, -40, 18, 46) -> rect(-6, -40, 12, 46)), so it is only a
//     little wider than the 9-pixel shaft and looks closer to the painting.
//   - Colour layers on the canopy: a light green edge, lighter / darker
//     panels from simple lighting, alternating panels, a fold down the
//     middle of each panel and a scalloped rim.
//   - No transparency: the 4-value fill(r, g, b, alpha) was replaced. The
//     panels now change colour from cream to green with lerp() as the
//     umbrella opens, using only techniques shown in class.
//   - Canopy size from the joined version (user input-umberalla.js): a
//     narrower, taller canopy (rim half-width 290 -> 220, rim half-height
//     105 -> 110, rim higher up the shaft, ribs meeting near the tip, tip
//     at -510). Everything else is unchanged.
//   - Canvas size from the joined version: the canvas now fills the whole
//     browser window (windowWidth x windowHeight) instead of 800 x 600, like
//     the main sketch. The umbrella stands where the woman's hand is in the
//     reference picture (566, 588 in picture units, 1041 x 1511) and is
//     scaled with scale() so it grows and shrinks with the window.
//
// Techniques used:
//   setup(), draw(), createCanvas(), background()            (Week 6)
//   windowWidth, windowHeight, windowResized(), resizeCanvas() (Week 8)
//   fill(), stroke(), strokeWeight(), noStroke()             (Week 6)
//   rect(), line(), triangle()                               (Week 6)
//   mouseX, mouseY, mousePressed(), constrain()              (Week 6)
//   dist()                                                   (Week 7)
//   class, constructor, this, methods                        (Week 7)
//   colour arrays passed to fill() / stroke()                (Week 7)
//   objects { name: value }, array[0]                        (Week 3)
//   functions that return an object, for loops, if, ===      (Week 4)
//   % remainder, array.push()                                (Week 8)
//   push() / pop() for drawing                               (Week 8)
//   translate(), rotate(), angleMode(DEGREES), sin(), cos()  (Week 8)
//   scale(), min()                                           (Week 11)
//   map()                                                    (Week 10)
//   lerp() easing and colour mixing, arc(), max()            (Week 11)

// The reference picture is 1041 x 1511 "picture units". The umbrella's
// position and size are in these units.
const designWidth = 1041;
const designHeight = 1511;

// This variable will hold our single Umbrella object.
let umbrella;

// pictureScale() — how many canvas pixels one picture unit is: the picture
// is made as big as possible while still fitting inside the window.
// min() picks the smaller of the two scales, so nothing is cut off.
function pictureScale() {
  return min(width / designWidth, height / designHeight);
}

// setup() runs ONCE when the sketch starts.
function setup() {
  // Fill the whole browser window (windowWidth / windowHeight: Week 8).
  createCanvas(windowWidth, windowHeight);

  // Measure every angle in degrees (0–360) instead of radians, the same
  // as the Week 8 and Week 11 Tutorials. This affects rotate(), sin(),
  // cos() and arc().
  angleMode(DEGREES);

  // The (x, y) we pass in is where the woman's hand holds the umbrella in
  // the picture, in picture units. This point is also the pivot that the
  // umbrella rotates around.
  umbrella = new Umbrella(566, 588);
}

// When the browser window changes size (windowResized and resizeCanvas:
// Week 8). The umbrella is drawn in picture units, so it rescales by itself.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// draw() runs repeatedly, once per frame (about 60 times per second).
function draw() {
  // Clear the canvas every frame with a sky-blue colour, so the moving
  // umbrella doesn't leave a trail.
  background(110, 172, 232);

  // Update first, then draw (the same pattern as head.update() and
  // head.display() in the Week 11 Tutorial).
  umbrella.move();
  umbrella.display();
}

// mousePressed() is called automatically by p5.js on every click.
// Here we check whether the click landed on the umbrella.
function mousePressed() {
  // Everything is in picture units, so multiply by k to get canvas pixels.
  let k = pictureScale();

  // Work out the umbrella's current size.
  let s = getShape(umbrella.openAmount);

  // The middle of the canopy is straight above the handle, halfway
  // between the rim and the tip. rimY and tipY are measured from the
  // handle, so we add umbrella.y to turn them into canvas positions.
  // (The umbrella only tilts by about 8 degrees, so we can ignore the
  // tilt here — the click area below is large enough to cover it.)
  let centreX = umbrella.x * k;
  let centreY = (umbrella.y + (s.rimY + umbrella.tipY) / 2) * k;

  // How close the click needs to be: the current canopy width, but never
  // less than 90 units, so the thin CLOSED umbrella is still easy to hit.
  let hitRadius = max(s.rimHalfWidth, 90) * k;

  // dist() gives the distance between the mouse and the canopy middle.
  let d = dist(mouseX, mouseY, centreX, centreY);
  if (d < hitRadius) {
    umbrella.toggle();
  }
}

// getShape(openAmount) — work out the umbrella's current size.
//   openAmount: 0 = closed, 1 = open
// Returns an object { name: value } (like newPerson() in the Week 4
// Tutorial). lerp(closedValue, openValue, openAmount) gives the closed
// value at 0, the open value at 1, and a smooth mix in between.
function getShape(openAmount) {
  // Half the width of the umbrella's bottom edge (the rim).
  let rimHalfWidth = lerp(24, 220, openAmount);

  // Half the height of the rim. The rim is a flattened ellipse, because
  // we look up at the umbrella from below (perspective).
  let rimHalfHeight = lerp(5, 110, openAmount);

  // Height of the centre of the rim. It rises as the umbrella opens.
  let rimY = lerp(-250, -385, openAmount);

  // The "hub": where the ribs meet underneath the fabric. When open it
  // sits 80 pixels above the rim centre, high up near the tip; when
  // closed it is the same as the rim centre.
  let hubY = rimY - 80 * openAmount;

  return {
    rimHalfWidth: rimHalfWidth,
    rimHalfHeight: rimHalfHeight,
    rimY: rimY,
    hubY: hubY
  };
}

// The Umbrella class keeps the umbrella's data (position, state, colours)
// and its behaviour (toggle, move, display) together.
class Umbrella {
  // constructor() runs once when we call "new Umbrella(x, y)".
  constructor(x, y) {
    // The hand that holds the umbrella (in picture units), and the pivot
    // for swaying.
    this.x = x;
    this.y = y;

    // isOpen is the TARGET state that the user chooses by clicking.
    // openAmount is the CURRENT state used for drawing (0 = closed,
    // 1 = open). It moves gradually towards the target in move(), which
    // creates the smooth opening / closing animation.
    this.isOpen = false;
    this.openAmount = 0;

    // Current tilt of the umbrella in degrees (0 = upright).
    this.angle = 0;

    // Number of fabric panels (and ribs).
    this.panelCount = 8;

    // Height of the top tip, relative to the handle. Negative because it
    // is ABOVE the handle (in p5.js, y increases downwards).
    this.tipY = -510;

    // Colours as [r, g, b] arrays, passed straight into fill() or stroke()
    // like fill(this.srcImgSegColour) in the Week 7 Tutorial.
    this.cream = [242, 234, 214];    // outer fabric and tip
    this.creamShadow = [222, 210, 184];  // shaded side of the dome
    this.green = [112, 168, 108];    // base green of the inner panels
    this.brown = [125, 88, 62];      // shaft
    this.darkBrown = [100, 70, 50];  // handle
  }

  // toggle() — switch between open and closed.
  toggle() {
    // "!" (logical NOT) turns true into false and false into true.
    this.isOpen = !this.isOpen;
  }

  // move() — update the umbrella's data. Called once per frame.
  move() {
    // 1) Opening / closing
    // The ternary operator picks 1 when open, 0 when closed.
    let target = this.isOpen ? 1 : 0;

    // Easing (Week 11): each frame, move 8% of the remaining distance
    // towards the target. The motion starts fast and slows down smoothly.
    this.openAmount = lerp(this.openAmount, target, 0.08);

    // 2) Swaying with the mouse
    // Keep the mouse x inside the canvas, then convert it into an angle
    // between -8 degrees (mouse on the left) and +8 degrees (right).
    let mx = constrain(mouseX, 0, width);
    let targetAngle = map(mx, 0, width, -8, 8);

    // Ease the angle as well, so the umbrella follows the mouse softly.
    this.angle = lerp(this.angle, targetAngle, 0.06);
  }

  // display() — draw the whole umbrella. Called once per frame.
  display() {
    let s = getShape(this.openAmount);

    // How many canvas pixels one picture unit is.
    let k = pictureScale();

    // Save the drawing settings, then transform in the Week 11 order:
    // translate -> rotate -> scale.
    // 1. translate: move the origin (0, 0) to the hand.
    // 2. rotate: tilt the umbrella around the hand.
    // 3. scale: from now on 1 unit = 1 picture unit, so the umbrella grows
    //    and shrinks with the canvas.
    push();
    translate(this.x * k, this.y * k);
    rotate(this.angle);
    scale(k);
    noStroke();

    // 1) Cream dome: the top half of an ellipse.
    // arc(centreX, centreY, width, height, startAngle, stopAngle)
    // Angles are measured clockwise from 3 o'clock, so 180 -> 360 sweeps
    // over the TOP. arc() takes the height of the WHOLE ellipse, and the
    // rim-to-tip distance is only half of it, so we multiply by 2.
    let domeW = s.rimHalfWidth * 2;
    let domeH = (s.rimY - this.tipY) * 2;
    fill(this.cream);
    arc(0, s.rimY, domeW, domeH, 180, 360);

    // Shadow on the left side for a 3D look (light comes from the right).
    // Step A: a darker quarter of the ellipse, from 180 to 270 degrees
    //         (9 o'clock to 12 o'clock).
    // Step B: cover most of it with a narrower cream dome (78% of the
    //         width), so only a thin crescent of shadow is left on the left.
    fill(this.creamShadow);
    arc(0, s.rimY, domeW, domeH, 180, 270);
    fill(this.cream);
    arc(0, s.rimY, domeW * 0.78, domeH * 0.99, 180, 360);

    // 2) Green inner panels, seen from below, with several colour layers.
    // The inside is hidden when closed, so the panels change from the cream
    // of the dome to green as the umbrella opens (no transparency needed):
    //   openAmount 0.1 or less -> greenAmount 0 (cream, blends into the dome)
    //   openAmount 0.6 or more -> greenAmount 1 (fully green)
    // map() converts the range (Week 10); constrain() keeps it 0 - 1 (Week 6).
    let greenAmount = constrain(map(this.openAmount, 0.1, 0.6, 0, 1), 0, 1);

    if (greenAmount > 0) {
      // The points where the ribs end on the rim (an array of { x, y }),
      // and the hub where all the ribs meet.
      let rim = getRimPoints(s, this.panelCount);
      let hub = { x: 0, y: s.hubY };

      // Layer A: a light yellow-green edge around the rim.
      // Every panel is drawn a little bigger first; the real panels are
      // drawn on top, so only a thin light edge stays visible.
      noStroke();
      fill(mixColour(this.cream, [165, 205, 120], greenAmount));
      for (let i = 0; i < rim.length; i++) {
        // Index of the next rib. % wraps the last one back to 0, so the
        // last panel joins the first (Week 8: frameCount % arrayLength).
        let next = (i + 1) % rim.length;
        let edgeMiddle = enlarge(getScallop(rim[i], rim[next], hub), s.rimY);
        let ribEnd = enlarge(rim[i], s.rimY);
        let nextRibEnd = enlarge(rim[next], s.rimY);
        triangle(hub.x, hub.y, ribEnd.x, ribEnd.y, edgeMiddle.x, edgeMiddle.y);
        triangle(hub.x, hub.y, edgeMiddle.x, edgeMiddle.y, nextRibEnd.x, nextRibEnd.y);
      }

      // Layer B: the panels themselves.
      for (let i = 0; i < rim.length; i++) {
        let next = (i + 1) % rim.length;

        // The middle of the panel's outer edge, pulled in a little towards
        // the hub, so the edge curves inwards between ribs (scalloped).
        let edgeMiddle = getScallop(rim[i], rim[next], hub);

        // Simple lighting: the light comes from the upper right.
        // cos() is 1 when the panel faces the light and -1 when it faces
        // away, so light ends up between about 0.72 (dark) and 1.04 (bright).
        let panelAngle = (360 / rim.length) * (i + 0.5);
        let light = 0.88 + 0.16 * cos(panelAngle - 23);

        // Neighbouring panels alternate a little lighter / darker.
        if (i % 2 === 0) {
          light = light - 0.06;
        }

        // Each panel is split into two triangles, one slightly lighter and
        // one slightly darker, like the fold down the middle of the fabric.
        fillGreen(this.green, light + 0.05, this.cream, greenAmount);
        triangle(hub.x, hub.y, rim[i].x, rim[i].y, edgeMiddle.x, edgeMiddle.y);
        fillGreen(this.green, light - 0.05, this.cream, greenAmount);
        triangle(hub.x, hub.y, edgeMiddle.x, edgeMiddle.y, rim[next].x, rim[next].y);
      }

      // Layer C: the ribs, thin dark-green lines from the hub to the rim.
      stroke(mixColour(this.cream, [84, 132, 82], greenAmount));
      strokeWeight(2);
      for (let i = 0; i < rim.length; i++) {
        line(hub.x, hub.y, rim[i].x, rim[i].y);
      }
    }

    // 3) Shaft: starts at the bottom of the folded fabric when closed and
    // at the hub when open; lerp blends between the two.
    let startY = lerp(s.rimY + s.rimHalfHeight, s.hubY, this.openAmount);
    stroke(this.brown);
    strokeWeight(9);
    line(0, startY, 0, 0);

    // 4) Handle: a darker rectangle around the bottom of the shaft.
    // rect(x, y, width, height) — x = -6 and width = 12 centre it on
    // the shaft (only slightly wider than the 9-pixel shaft).
    noStroke();
    fill(this.darkBrown);
    rect(-6, -40, 12, 46);

    // 5) Tip: a narrow cream triangle pointing up from the top of the dome.
    fill(this.cream);
    triangle(-10, this.tipY + 6, 0, this.tipY - 22, 10, this.tipY + 6);

    // Restore the settings, removing our translate, rotate and scale.
    pop();
  }
}

// getRimPoints(s, panelCount) — where each rib ends on the rim.
// Returns an array of { x, y } objects, one per rib.
function getRimPoints(s, panelCount) {
  let points = [];
  for (let i = 0; i < panelCount; i++) {
    // Spread the ribs evenly around 360 degrees (45 degrees apart with 8).
    let a = (360 / panelCount) * i;

    // Polar coordinates (Week 11): x = radius * cos, y = radius * sin,
    // with a smaller radius for y so the circle becomes a flat ellipse
    // (we look at the rim from below).
    // points.push() is the ARRAY push (Week 8), not the drawing push().
    points.push({ x: cos(a) * s.rimHalfWidth, y: s.rimY + sin(a) * s.rimHalfHeight });
  }
  return points;
}

// getScallop(ribA, ribB, hub) — the halfway point between two ribs, moved
// 10% of the way towards the hub with lerp(), so the fabric edge curves in.
function getScallop(ribA, ribB, hub) {
  return {
    x: lerp((ribA.x + ribB.x) / 2, hub.x, 0.1),
    y: lerp((ribA.y + ribB.y) / 2, hub.y, 0.1)
  };
}

// enlarge(point, rimY) — push a rim point a little outwards (3% sideways,
// 8% up / down), used for the light edge around the rim.
function enlarge(point, rimY) {
  return {
    x: point.x * 1.03,
    y: rimY + (point.y - rimY) * 1.08
  };
}

// mixColour(fromColour, toColour, amount) — a colour between two
// [r, g, b] colours: amount 0 = fromColour, 1 = toColour. lerp() (Week 11)
// mixes each of red, green and blue, taken out with [0], [1], [2] (Week 3).
// Returns a new [r, g, b] array that can go straight into fill() / stroke()
// (Week 7).
function mixColour(fromColour, toColour, amount) {
  return [
    lerp(fromColour[0], toColour[0], amount),
    lerp(fromColour[1], toColour[1], amount),
    lerp(fromColour[2], toColour[2], amount)
  ];
}

// fillGreen(green, light, cream, greenAmount) — a lighter (light > 1) or
// darker (light < 1) version of the base green, mixed with cream while the
// umbrella is still opening. Each value is multiplied like
// fill(randomOrNoiseArray[i] * 360, 100, 100) in the Week 8 Tutorial.
function fillGreen(green, light, cream, greenAmount) {
  let shadedGreen = [green[0] * light, green[1] * light, green[2] * light];
  fill(mixColour(cream, shadedGreen, greenAmount));
}
