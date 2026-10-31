// user input-umberalla.js
// MECHANIC: User input  (owner: Jiahui Zou)
// The umbrella opens / closes when clicked and sways towards the mouse.
// Both changes are eased with lerp(), so nothing jumps between states.
//
// JOINED TO THE MAIN SKETCH (iteration 3). Changes made for this:
//   - setup() is now setupUmbrella() and draw() is now drawUmbrella();
//     sketch.js calls them (there can be only one setup() and draw()).
//   - createCanvas(), background() and angleMode() moved to sketch.js.
//   - The umbrella is held by the woman: every frame it is moved to her hand
//     (getWomanHand() in woman-figure.js) and scaled with umbrellaScale().
//   - mousePressed() now takes that scale into account.
//   - The sway is wider: -60 to +60 degrees (120 degrees in all) instead of -8 to +8, and it follows the mouse faster (Lizuo, iteration 4).
//
// AI note: written with the help of Claude (Anthropic).
// "(Week N)" = the Canvas module where the course teaches that technique.
//
// Techniques used:
//   fill(), stroke(), strokeWeight(), noStroke()             (Week 6)
//   rect(), line(), triangle()                               (Week 6)
//   mouseX, mouseY, mousePressed(), constrain()              (Week 6)
//   dist()                                                   (Week 7)
//   class, constructor, this, methods                        (Week 7)
//   colour arrays passed to fill() / stroke()                (Week 7)
//   objects { name: value }, array[0]                        (Week 3)
//   functions that return an object                          (Week 4)
//   for loops, if statements, ===                            (Week 4)
//   % remainder, array.push()                                (Week 8)
//   push() / pop() for drawing (not array.push!)             (Week 8)
//   translate(), rotate(), scale(), sin(), cos()             (Week 8)
//   map()                                                    (Week 10)
//   lerp() easing, arc(), max(), transparency                (Week 11)

// This variable will hold our single Umbrella object (an instance of the
// Umbrella class defined further down in this file).
let umbrella;

// setupUmbrella() — called once from setup() in sketch.js.
// (Was setup() before the umbrella joined the main sketch.)
function setupUmbrella() {
  umbrella = new Umbrella();
}

// drawUmbrella() — called every frame from draw() in sketch.js.
// (Was draw() before; background() now happens in sketch.js.)
function drawUmbrella() {
  // Update first, then draw (the same pattern as head.update() and
  // head.display() in the Week 11 Tutorial).
  umbrella.move();
  umbrella.display();
}

// mousePressed() is called automatically by p5.js on every click.
// Here we check whether the click landed on the umbrella.
function mousePressed() {
  // The umbrella is drawn in "umbrella units" and then scaled, so every
  // length has to be multiplied by the same scale to get canvas pixels.
  let k = umbrellaScale();
  let s = getShape(umbrella.openAmount);

  // How far the middle of the canopy is from the hand, along the shaft
  // (halfway between the rim and the tip), in canvas pixels.
  // rimY and tipY are negative (above the hand), so we flip the sign.
  let r = -((s.rimY + umbrella.tipY) / 2) * k;

  // The umbrella can now lean up to 60 degrees, so the canopy is no longer
  // straight above the hand. Polar coordinates (Week 11 Tutorial) give
  // its position on a circle around the hand: the angle is measured from
  // straight up, so sin() gives the sideways part and cos() the upward part.
  let centreX = umbrella.x + sin(umbrella.angle) * r;
  let centreY = umbrella.y - cos(umbrella.angle) * r;

  // How close the click needs to be: the current canopy width, but never
  // less than 90 units, so the thin CLOSED umbrella is still easy to hit.
  let hitRadius = max(s.rimHalfWidth, 90) * k;

  // dist() gives the distance between the mouse and the canopy middle.
  let d = dist(mouseX, mouseY, centreX, centreY);
  if (d < hitRadius) {
    umbrella.toggle();
  }
}

// getShape(openAmount) — work out the umbrella's current size, in umbrella
// units (before scaling), measured from the hand along the shaft.
//   openAmount: 0 = closed, 1 = open
// Returns an object { name: value } (like newPerson() in the Week 4
// Tutorial). lerp(closedValue, openValue, openAmount) gives the closed
// value at 0, the open value at 1, and a smooth mix in between.
function getShape(openAmount) {
  // Half the width of the umbrella's edge (the rim).
  let rimHalfWidth = lerp(24, 220, openAmount);

  // Half the height of the rim. The rim is a flattened ellipse, because
  // we look up at the umbrella from below (perspective).
  let rimHalfHeight = lerp(5, 110, openAmount);

  // Distance from the hand up to the centre of the rim.
  let rimY = lerp(-250, -385, openAmount);

  // The "hub": where the ribs meet underneath the fabric, high up near
  // the tip when the umbrella is open.
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
  // constructor() runs once when we call "new Umbrella()".
  constructor() {
    // Where the hand holds the shaft, in canvas pixels. This is the pivot
    // the umbrella rotates around. It is updated every frame in move(),
    // so the umbrella stays in the woman's hand.
    this.x = 0;
    this.y = 0;

    // isOpen is the TARGET state that the user chooses by clicking.
    // openAmount is the CURRENT state used for drawing (0 = closed,
    // 1 = open). It starts open, like in the painting, and moves
    // gradually towards the target in move().
    this.isOpen = true;
    this.openAmount = 1;

    // Current tilt of the umbrella in degrees (0 = upright). angleMode()
    // is set in sketch.js.
    this.angle = 0;

    // Number of fabric panels (and ribs).
    this.panelCount = 8;

    // Distance from the hand up to the tip, in umbrella units. Negative
    // because it is ABOVE the hand (in p5.js, y increases downwards).
    this.tipY = -510;

    // Colours as [r, g, b] arrays, passed straight into fill() or stroke()
    // like fill(this.srcImgSegColour) in the Week 7 Tutorial.
    this.cream = [242, 236, 216];        // outer fabric and tip
    this.creamShadow = [222, 212, 186];  // shaded side of the dome
    this.green = [98, 158, 90];          // base green of the inner panels
    this.brown = [120, 86, 60];          // shaft
    this.darkBrown = [95, 68, 48];       // handle
  }

  // toggle() — switch between open and closed.
  toggle() {
    // "!" (logical NOT) turns true into false and false into true.
    this.isOpen = !this.isOpen;
  }

  // move() — update the umbrella's data. Called once per frame.
  move() {
    // 0) Stay in the woman's hand: getWomanHand() (woman-figure.js)
    // returns an object with the hand's x and y on the canvas.
    let hand = getWomanHand();
    this.x = hand.x;
    this.y = hand.y;

    // 1) Opening / closing
    // The ternary operator picks 1 when open, 0 when closed.
    let target = this.isOpen ? 1 : 0;

    // Easing (Week 11): each frame, move 8% of the remaining distance
    // towards the target. The motion starts fast and slows down smoothly.
    this.openAmount = lerp(this.openAmount, target, 0.08);

    // 2) Swaying with the mouse (wider and faster, Lizuo, iteration 4)
    // Keep the mouse x inside the canvas, then convert it into an angle
    // between -60 degrees (mouse on the left) and +60 degrees (right),
    // 120 degrees in all.
    let mx = constrain(mouseX, 0, width);
    let targetAngle = map(mx, 0, width, -60, 60);

    // Ease the angle as well. 0.15 per frame (was 0.06) makes the umbrella
    // follow the mouse faster, but it still moves smoothly.
    this.angle = lerp(this.angle, targetAngle, 0.15);
  }

  // display() — draw the whole umbrella. Called once per frame.
  display() {
    let s = getShape(this.openAmount);

    // Save the drawing settings, then transform in the Week 11 order:
    // translate -> rotate -> scale.
    // 1. translate: move the origin (0, 0) to the woman's hand.
    // 2. rotate: tilt the umbrella around her hand.
    // 3. scale: make the umbrella the right size for the woman and canvas.
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    scale(umbrellaScale());
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
    // The inside is hidden when closed, so the green fades in as the
    // umbrella opens: openAmount 0.1 -> alpha 0, openAmount 0.6 -> 255.
    // constrain() keeps alpha between 0 and 255.
    let alpha = constrain(map(this.openAmount, 0.1, 0.6, 0, 255), 0, 255);

    if (alpha > 0) {
      // The points where the ribs end on the rim (an array of { x, y }),
      // and the hub where all the ribs meet.
      let rim = getRimPoints(s, this.panelCount);
      let hub = { x: 0, y: s.hubY };

      // Layer A: a light yellow-green edge around the rim.
      // Every panel is drawn a little bigger first; the real panels are
      // drawn on top, so only a thin light edge stays visible.
      fill(150, 192, 106, alpha);
      for (let i = 0; i < rim.length; i++) {
        // Index of the next rib. % wraps the last one back to 0, so the
        // last panel joins the first (Week 8: frameCount % arrayLength).
        let next = (i + 1) % rim.length;
        let mid = getScallop(rim[i], rim[next], hub);

        let p1 = enlarge(rim[i], s.rimY);
        let p2 = enlarge(rim[next], s.rimY);
        let m = enlarge(mid, s.rimY);
        triangle(hub.x, hub.y, p1.x, p1.y, m.x, m.y);
        triangle(hub.x, hub.y, m.x, m.y, p2.x, p2.y);
      }

      // Layer B: the panels themselves.
      for (let i = 0; i < rim.length; i++) {
        let next = (i + 1) % rim.length;
        let p1 = rim[i];
        let p2 = rim[next];

        // The middle of the panel's outer edge, pulled in a little towards
        // the hub, so the edge curves inwards between ribs (scalloped).
        let mid = getScallop(p1, p2, hub);

        // Simple lighting: the light comes from the upper right.
        // midAngle points to the middle of this panel (degrees).
        // cos() is 1 when the panel faces the light and -1 when it faces
        // away, so light ends up between about 0.72 (dark) and 1.04 (bright).
        let midAngle = (360 / rim.length) * (i + 0.5);
        let light = 0.88 + 0.16 * cos(midAngle - 23);

        // Neighbouring panels alternate a little lighter / darker.
        if (i % 2 === 0) {
          light = light - 0.06;
        }

        // Each panel is split into two triangles, one slightly lighter
        // and one slightly darker, like the fold down the middle of each
        // piece of fabric.
        fillGreen(this.green, light + 0.05, alpha);
        triangle(hub.x, hub.y, p1.x, p1.y, mid.x, mid.y);
        fillGreen(this.green, light - 0.05, alpha);
        triangle(hub.x, hub.y, mid.x, mid.y, p2.x, p2.y);
      }

      // Layer C: the ribs, thin dark-green lines from the hub to the rim.
      stroke(64, 116, 66, alpha);
      strokeWeight(2);
      for (let i = 0; i < rim.length; i++) {
        line(hub.x, hub.y, rim[i].x, rim[i].y);
      }
      noStroke();
    }

    // 3) Shaft: starts at the bottom of the folded fabric when closed and
    // at the hub when open; lerp blends between the two.
    let startY = lerp(s.rimY + s.rimHalfHeight, s.hubY, this.openAmount);
    stroke(this.brown);
    strokeWeight(7);
    line(0, startY, 0, 0);

    // 4) Handle: a darker rectangle at the bottom of the shaft, mostly
    // hidden by the woman's hand. rect(x, y, width, height).
    noStroke();
    fill(this.darkBrown);
    rect(-5, -10, 10, 40);

    // 5) Tip: a narrow cream triangle pointing up from the top of the dome.
    fill(this.cream);
    triangle(-8, this.tipY + 6, 0, this.tipY - 18, 8, this.tipY + 6);

    // Restore the settings, removing our translate, rotate and scale.
    pop();
  }
}

// getRimPoints(s, panelCount) — where each rib ends on the rim.
// Returns an array of { x, y } objects, one per rib.
function getRimPoints(s, panelCount) {
  let points = [];
  for (let i = 0; i < panelCount; i++) {
    // Spread the ribs evenly around 360 degrees.
    let a = (360 / panelCount) * i;

    // Polar coordinates (Week 11): x = radius * cos, y = radius * sin,
    // with a smaller radius for y so the circle becomes an ellipse.
    // points.push() is the ARRAY push (Week 8), not the drawing push().
    points.push({ x: cos(a) * s.rimHalfWidth, y: s.rimY + sin(a) * s.rimHalfHeight });
  }
  return points;
}

// getScallop(p1, p2, hub) — the halfway point between two ribs, moved 10%
// of the way towards the hub with lerp(), so the fabric edge curves in.
function getScallop(p1, p2, hub) {
  return {
    x: lerp((p1.x + p2.x) / 2, hub.x, 0.1),
    y: lerp((p1.y + p2.y) / 2, hub.y, 0.1)
  };
}

// enlarge(p, rimY) — push a rim point a little outwards (3% sideways,
// 8% up / down), used for the light edge around the rim.
function enlarge(p, rimY) {
  return {
    x: p.x * 1.03,
    y: rimY + (p.y - rimY) * 1.08
  };
}

// fillGreen(green, light, alpha) — a lighter (light > 1) or darker
// (light < 1) version of the base green. Each value is taken out of the
// array with [0], [1], [2] (Week 3) and multiplied, like
// fill(randomOrNoiseArray[i] * 360, 100, 100) in the Week 8 Tutorial.
function fillGreen(green, light, alpha) {
  fill(green[0] * light, green[1] * light, green[2] * light, alpha);
}
