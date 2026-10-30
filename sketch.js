// sketch.js — SHARED GROUP MAIN FILE
// Combines the three mechanics on one p5.js canvas:
// 1) Fei Jiang: Time-based four-season sky (time-based-sky.js)
// 2) Perlin Noise / Randomness meadow (perlin-grass.js)
// 3) User Input umbrella (umbrella class and functions below)
//
// Group integration acknowledgement: ChatGPT (OpenAI) assisted with merging
// the previously separate setup() and draw() functions. The meadow and
// umbrella mechanic implementations below remain the original group code.
// The original group's Claude (Anthropic) acknowledgements are retained below.
//
// Before sketch.js, index.html must load p5.min.js, perlin-grass.js,
// and time-based-sky.js, in that order.

// The Perlin meadow's original prototype credited Claude (Anthropic).
// It uses setupMeadow(), drawMeadow(), setWindLevel(), scatterFlowers().

// =====================================================
// SHARED SETUP / DRAW
// =====================================================


function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);   // Required for the sky, falling leaves, and umbrella
  frameRate(60); // Target 60 FPS
  setupMeadow();        // Perlin meadow initialisation
  umbrella = new Umbrella(width / 2, height - 40);
}

function draw() {
  // Back-to-front drawing order: the sky should not cover the meadow
  // or umbrella. drawSky() redraws the whole sky each frame.
  drawSky();              // Fei Jiang: time-based four-season sky
  drawMeadow();           // Perlin Noise / Randomness meadow
  umbrella.move();        // User Input: update umbrella tilt / opening
  umbrella.display();     // User Input: draw umbrella in the foreground
}

// Keep the meadow's responsive canvas and reposition the umbrella too.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (umbrella) {
    umbrella.x = width / 2;
    umbrella.y = height - 40;
  }
}

// Original meadow keyboard controls: 1, 2, 3 change wind;
// R scatters the flowers again.
function keyPressed() {
  if (key === '1') setWindLevel(0);
  if (key === '2') setWindLevel(1);
  if (key === '3') setWindLevel(2);
  if (key === 'r' || key === 'R') scatterFlowers();
}

// =====================================================
// ORIGINAL USER INPUT UMBRELLA — preserved from group sketch.js
// =====================================================

// sketch.js -user input
// Main file: owns the canvas and runs the user-input mechanic.
// The umbrella opens / closes when clicked and sways towards the mouse.
// Both changes are eased with lerp(), so nothing jumps between states.
//
// AI note: written with the help of Claude  （Anthropic).
// "(Week N)" = the Canvas module where the course teaches that technique.
//
// Techniques used:
//   setup(), draw(), createCanvas(), background()            (Week 6)
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
//   translate(), rotate(), angleMode(DEGREES), sin(), cos()  (Week 8)
//   map()                                                    (Week 10)
//   lerp() easing, arc(), max(), transparency                (Week 11)

// This variable will hold our single Umbrella object (an instance of the
// Umbrella class defined further down in this file).
let umbrella;

// The umbrella is initialised in the shared setup() above, and its
// move() / display() methods are called by the shared draw() above.

// mousePressed() is a built-in p5.js event function.
// p5.js calls it automatically, once, every time the mouse is clicked.
// Here we check whether the click landed on the umbrella.
function mousePressed() {
  // Work out the umbrella's current size. We read openAmount from the
  // umbrella object from outside the class, like
  // segment.srcImgSegXPos in the Week 7 Tutorial.
  let s = getShape(umbrella.openAmount);

  // The middle of the canopy is straight above the handle, halfway
  // between the rim and the tip. rimY and tipY are measured from the
  // handle, so we add umbrella.y to turn them into canvas positions.
  // (The umbrella only tilts by about 8 degrees, so we can ignore the
  // tilt here — the click area below is large enough to cover it.)
  let centreX = umbrella.x;
  let centreY = umbrella.y + (s.rimY + umbrella.tipY) / 2;

  // How close the click needs to be. Use the current canopy width,
  // but never less than 90 pixels, so the CLOSED umbrella (which is
  // very thin) is still easy to click.
  let hitRadius = max(s.rimHalfWidth, 90);

  // dist() gives the distance between the mouse and the canopy middle.
  let d = dist(mouseX, mouseY, centreX, centreY);

  // If the mouse is close enough, open or close the umbrella.
  if (d < hitRadius) {
    umbrella.toggle();
  }
}

// The class keeps the umbrella's data (position, state, colours) and
// its main behaviour (toggle, move, display) together.
// The detailed drawing is done by separate custom functions further
// down (drawOuter, drawInner, drawShaft, drawTip). display() calls them
// and passes in the values they need as parameters.
class Umbrella {
  // constructor() runs once when we call "new Umbrella(x, y)".
  // It sets up the starting values for this object.
  constructor(x, y) {
    // Position of the bottom of the handle on the canvas.
    // This is also the pivot point for the swaying rotation.
    this.x = x;
    this.y = y;

    // isOpen is the TARGET state that the user chooses by clicking.
    this.isOpen = false;
    // openAmount is the CURRENT state used for drawing:
    //   0 = fully closed, 1 = fully open.
    // It moves gradually towards the target (see move()), which is what
    // creates the smooth opening / closing animation.
    this.openAmount = 0;

    // Current tilt of the umbrella, in degrees (0 = perfectly upright).
    this.angle = 0;

    // Number of fabric panels (and ribs) the umbrella has.
    this.panelCount = 8;

    // Height of the umbrella's top tip, relative to the handle.
    // Negative because it is ABOVE the handle (in p5.js, y increases
    // downwards). It never changes.
    this.tipY = -500;

    // Stored as [r, g, b] arrays so all colours are managed in one place
    // and are easy to change later. A whole colour array can be passed
    // straight into fill() or stroke(), e.g. fill(this.cream) — the same
    // approach as fill(this.srcImgSegColour) in the Week 7 Tutorial.
    this.green = [112, 168, 108];        // base green of the inner fabric
    this.cream = [242, 234, 214];        // cream outer fabric
    this.creamShadow = [222, 210, 184];  // darker cream for the shaded side
    this.brown = [125, 88, 62];          // wooden shaft
    this.darkBrown = [100, 70, 50];      // darker brown for the handle
  }

  // toggle() — switch between open and closed.
  // Called from mousePressed() when the umbrella is clicked.
  toggle() {
    // "!" is the logical NOT operator: true becomes false and
    // false becomes true.
    this.isOpen = !this.isOpen;
  }

  // move() — update the umbrella's data. Called once per frame.
  move() {
    // 1) Opening / closing
    // Choose the target value with the ternary operator:
    //   condition ? valueIfTrue : valueIfFalse
    // So target is 1 when the umbrella should be open, 0 when closed.
    let target = this.isOpen ? 1 : 0;

    // Easing (Week 11): each frame, move openAmount 8% of the remaining
    // distance towards the target. Big steps when far away, tiny steps
    // when close, so the motion starts fast and slows down smoothly
    // instead of jumping straight to the end.
    this.openAmount = lerp(this.openAmount, target, 0.08);

    // 2) Swaying with the mouse
    // Keep the mouse x inside the canvas, so the umbrella doesn't tilt
    // too far when the mouse leaves the canvas.
    let mx = constrain(mouseX, 0, width);

    // Convert the mouse x range (0 to width) into an angle range
    // (-8 to +8 degrees).
    // Mouse on the left  -> negative angle -> tilts left.
    // Mouse on the right -> positive angle -> tilts right.
    let targetAngle = map(mx, 0, width, -8, 8);

    // Ease the angle towards the target as well (6% per frame), so the
    // umbrella follows the mouse softly instead of snapping to it.
    this.angle = lerp(this.angle, targetAngle, 0.06);
  }

  // display() — draw the whole umbrella. Called once per frame.
  display() {
    // Get the current measurements from the custom function getShape().
    let s = getShape(this.openAmount);

    // push() saves the current drawing settings (transformations and
    // styles) so our changes below don't affect anything drawn later.
    push();

    // Move the origin (0, 0) to the bottom of the handle.
    // From now on we can draw the umbrella around (0, 0).
    translate(this.x, this.y);

    // Rotate the whole coordinate system around that new origin.
    // Because the origin is the handle, the umbrella swings around the
    // hand that holds it — this is the swaying effect.
    // Order matters: translate first, then rotate (Week 11).
    rotate(this.angle);

    // Draw the parts from back to front (later shapes cover earlier
    // ones, like layers of paper). Each custom function receives the
    // values it needs as parameters.
    drawOuter(s, this.tipY, this.cream, this.creamShadow);        // cream outer canopy (back layer)
    drawInner(s, this.openAmount, this.panelCount, this.green);   // green inner panels (seen from below)
    drawShaft(s, this.openAmount, this.brown, this.darkBrown);    // brown shaft and handle
    drawTip(this.tipY, this.cream);                               // small cream tip at the very top

    // pop() restores the settings saved by push(), removing our
    // translate and rotate so the rest of the sketch is unaffected.
    pop();
  }
}

// All of the functions below are drawn INSIDE the umbrella's translated
// and rotated coordinate system, where (0, 0) is the bottom of the
// handle and everything above it has a negative y value.

// getShape(openAmount) — work out the umbrella's current size.
//   openAmount: 0 = closed, 1 = open
// Returns an object { name: value, ... } with all the measurements the
// drawing functions need (like returning an object in the Week 4
// Tutorial).
function getShape(openAmount) {
  // lerp() is used here for interpolation rather than animation:
  // lerp(closedValue, openValue, openAmount) gives the closed value when
  // openAmount = 0, the open value when openAmount = 1, and a smooth
  // mix in between.

  // Half the width of the umbrella's bottom edge (the rim).
  // Narrow when closed (24), wide when open (290).
  let rimHalfWidth = lerp(24, 290, openAmount);

  // Half the height of the rim ellipse. The rim is drawn as a flattened
  // ellipse to suggest we are looking at it slightly from below
  // (perspective).
  let rimHalfHeight = lerp(5, 105, openAmount);

  // Height of the centre of the rim. It rises as the umbrella opens.
  let rimY = lerp(-170, -300, openAmount);

  // The "hub": where the ribs meet underneath the fabric.
  // When open it sits 55 pixels above the rim centre; when closed
  // (openAmount = 0) it is the same as the rim centre.
  let hubY = rimY - 55 * openAmount;

  // Send all four values back together in one object.
  return {
    rimHalfWidth: rimHalfWidth,
    rimHalfHeight: rimHalfHeight,
    rimY: rimY,
    hubY: hubY
  };
}

// getRimPoints(s, panelCount) — calculate where each rib ends on the rim.
// Returns an array of { x, y } objects (one per rib).
function getRimPoints(s, panelCount) {
  // Start with an empty array.
  let points = [];

  for (let i = 0; i < panelCount; i++) {
    // Spread the ribs evenly around a full circle (360 degrees).
    // With 8 panels the ribs are 45 degrees apart.
    let a = (360 / panelCount) * i;

    // Polar coordinates -> x and y (Week 11 Tutorial):
    //   x = radius · cos(angle),  y = radius · sin(angle)
    // We use a different radius for x and for y, so the circle is
    // squashed into an ellipse (the perspective view of the rim).
    // Here push() is the ARRAY method that adds an item to the end of
    // the array (like randomNumberArray.push() in the Week 8 Tutorial)
    // — not the drawing push() used in display().
    points.push({ x: cos(a) * s.rimHalfWidth, y: s.rimY + sin(a) * s.rimHalfHeight });
  }

  // Give the finished array back to the caller.
  return points;
}

// getScallop(p1, p2, hub) — the middle of the edge between two ribs,
// pulled 10% of the way towards the hub. This makes the fabric edge
// curve inwards between ribs, like a real umbrella.
// Returns an { x, y } object.
function getScallop(p1, p2, hub) {
  return {
    // (p1.x + p2.x) / 2 is the halfway point between the two ribs;
    // lerp(..., hub.x, 0.1) then moves it 10% towards the hub.
    x: lerp((p1.x + p2.x) / 2, hub.x, 0.1),
    y: lerp((p1.y + p2.y) / 2, hub.y, 0.1)
  };
}

// enlarge(p, rimY) — push a rim point slightly outwards.
// Used to make the cream border a little bigger than the green panels.
// Returns a NEW { x, y } object (the original point is not changed).
function enlarge(p, rimY) {
  return {
    // 3% further out horizontally (x is measured from the centre, 0).
    x: p.x * 1.03,
    // 8% further from the rim centre vertically.
    y: rimY + (p.y - rimY) * 1.08
  };
}

// drawOuter(s, tipY, cream, creamShadow) — the cream outer fabric.
//   s           : the measurements from getShape()
//   tipY        : height of the umbrella tip
//   cream       : [r, g, b] colour of the fabric
//   creamShadow : [r, g, b] colour of the shaded side
function drawOuter(s, tipY, cream, creamShadow) {
  // No outlines for the fabric shapes.
  noStroke();

  // Width of the dome: twice the rim's half-width, made 2% wider so
  // the dome slightly overlaps the edge of the green panels.
  let domeW = s.rimHalfWidth * 2.04;

  // arc() takes the width and height of the WHOLE ellipse, but we only
  // draw its top half. The distance from the rim up to the tip is only
  // HALF of the ellipse's height, so we multiply it by 2.
  // (rimY - tipY is positive because tipY is the more negative number.)
  let domeH = (s.rimY - tipY) * 2;

  // 1) The cream dome (top half of an ellipse)
  // arc(centreX, centreY, width, height, startAngle, stopAngle)
  // Angles are in degrees (because of angleMode(DEGREES) in setup) and
  // are measured clockwise from 3 o'clock:
  //   180 = 9 o'clock,  270 = 12 o'clock,  360 = back to 3 o'clock
  // Going from 180 to 360 sweeps over the TOP of the ellipse.
  // When filled, arc() fills the area back to its centre, giving a
  // solid half-ellipse.
  // Passing the whole colour array to fill() sets r, g and b at once.
  fill(cream);
  arc(0, s.rimY, domeW, domeH, 180, 360);

  // 2) A shadow on the left side for a 3D look
  // Light comes from the upper right, so the left side is darker.
  // Step A: draw a darker quarter of the ellipse on the left
  //         (from 180 to 270 degrees, i.e. 9 o'clock to 12 o'clock).
  fill(creamShadow);
  arc(0, s.rimY, domeW, domeH, 180, 270);

  // Step B: cover most of it with a slightly narrower cream dome
  //         (78% of the width). Only a thin crescent of shadow is left
  //         visible along the left edge.
  fill(cream);
  arc(0, s.rimY, domeW * 0.78, domeH * 0.99, 180, 360);

  // 3) The cream border around the rim
  // We draw the same wavy rim shape as the green panels, but slightly
  // larger. The green panels are drawn on top afterwards, so a thin
  // cream border stays visible around them — it looks like the outer
  // fabric wrapping around the edge.

  // The 8 points where the ribs end on the rim (stored in an array).
  let rim = getRimPoints(s, 8);

  // The hub point where all the ribs meet, as an { x, y } object
  // (an object written with name: value pairs, Week 3 Lecture).
  let hub = { x: 0, y: s.hubY };

  // Loop through every panel.
  for (let i = 0; i < rim.length; i++) {
    // Index of the NEXT rib. The % (remainder) operator wraps it
    // around: when i is the last index, (i + 1) % rim.length becomes 0,
    // so the last panel connects back to the first rib (the same idea
    // as frameCount % valueArrayLength in the Week 8 Tutorial).
    let next = (i + 1) % rim.length;

    // The middle of the edge between this rib and the next one.
    let mid = getScallop(rim[i], rim[next], hub);

    // Push all three points slightly outwards.
    let p1 = enlarge(rim[i], s.rimY);
    let p2 = enlarge(rim[next], s.rimY);
    let m = enlarge(mid, s.rimY);

    // Nudge the middle point down a little, so the cream border is a
    // bit thicker in the middle of each scallop.
    m.y += 3;

    // Each border piece is built from two triangles:
    // hub -> p1 -> m, and hub -> m -> p2.
    // triangle(x1, y1, x2, y2, x3, y3)  (Week 6 Lecture)
    triangle(hub.x, hub.y, p1.x, p1.y, m.x, m.y);
    triangle(hub.x, hub.y, m.x, m.y, p2.x, p2.y);
  }
}

// drawInner(s, openAmount, panelCount, green) — the green inside of the
// umbrella, seen from below.
//   s          : the measurements from getShape()
//   openAmount : how open the umbrella is (0 to 1)
//   panelCount : number of panels
//   green      : [r, g, b] base colour of the inner fabric
function drawInner(s, openAmount, panelCount, green) {
  // When the umbrella is closed you cannot see its inside, so the
  // green fades in as it opens:
  //   openAmount 0.1 or less  -> alpha 0   (invisible)
  //   openAmount 0.6 or more  -> alpha 255 (solid)
  // map() converts the range; constrain() stops alpha going below 0
  // or above 255 when openAmount is outside 0.1–0.6.
  let alpha = constrain(map(openAmount, 0.1, 0.6, 0, 255), 0, 255);

  // Only draw the inside if it is at least a little bit visible.
  if (alpha > 0) {
    // The rib end points on the rim, and the hub where the ribs meet.
    let rimPoints = getRimPoints(s, panelCount);
    let hub = { x: 0, y: s.hubY };

    // No outlines on the panels.
    noStroke();

    // Draw each of the panels.
    for (let i = 0; i < panelCount; i++) {
      // Rib at the start of this panel, and rib at the end of it
      // (% wraps the last panel back to the first rib).
      let p1 = rimPoints[i];
      let p2 = rimPoints[(i + 1) % panelCount];

      // The slightly curved-in middle of the panel's outer edge.
      let mid = getScallop(p1, p2, hub);

      // The angle pointing to the middle of this panel. 360 degrees is
      // a full circle, divided equally between the panels; + 0.5 moves
      // us from the panel's first rib to its centre.
      let midAngle = (360 / panelCount) * (i + 0.5);

      // cos() is largest (1) when the angle matches the light direction
      // and smallest (-1) on the opposite side. Subtracting 23 degrees
      // turns the light direction slightly, so panels facing it are
      // brighter.
      // light ends up roughly between 0.72 (dark) and 1.04 (bright).
      let light = 0.88 + 0.16 * cos(midAngle - 23);

      // Make every second panel a little darker so neighbouring panels
      // are easier to tell apart. i % 2 === 0 is true for even numbers.
      if (i % 2 === 0) {
        light -= 0.06;
      }

      // Split each panel into two triangles: one slightly lighter, one
      // slightly darker. This suggests the fold along the middle of
      // each piece of fabric.
      fillGreen(green, light + 0.05, alpha);
      triangle(hub.x, hub.y, p1.x, p1.y, mid.x, mid.y);
      fillGreen(green, light - 0.05, alpha);
      triangle(hub.x, hub.y, mid.x, mid.y, p2.x, p2.y);
    }

    // Thin dark-green lines from the hub to each rib end point.
    // They use the same alpha so they fade in together with the panels.
    stroke(84, 132, 82, alpha);
    strokeWeight(2);
    for (let i = 0; i < rimPoints.length; i++) {
      line(hub.x, hub.y, rimPoints[i].x, rimPoints[i].y);
    }
  }
}

// fillGreen(green, light, alpha) — set the fill to a lighter or darker
// version of the base green.
//   green : [r, g, b] base colour
//   light : > 1 -> lighter, < 1 -> darker
//   alpha : transparency (0 = invisible, 255 = solid)
function fillGreen(green, light, alpha) {
  // Here we cannot pass the whole array, because each value needs to be
  // changed first. We take each element out with [0], [1], [2]
  // (array indexing, Week 3 Lecture) and multiply it, the same idea as
  // fill(randomOrNoiseArray[i] * 360, 100, 100) in the Week 8 Tutorial.
  // Multiplying r, g and b by the same amount keeps the hue the same
  // and only changes the brightness.
  fill(green[0] * light, green[1] * light, green[2] * light, alpha);
}

// drawShaft(s, openAmount, brown, darkBrown) — the shaft and handle.
//   s          : the measurements from getShape()
//   openAmount : how open the umbrella is (0 to 1)
//   brown      : [r, g, b] colour of the shaft
//   darkBrown  : [r, g, b] colour of the handle
function drawShaft(s, openAmount, brown, darkBrown) {
  // Where the shaft starts at the top:
  //   closed (openAmount 0): at the bottom of the folded fabric
  //   open   (openAmount 1): up at the hub where the ribs meet
  // lerp blends smoothly between the two as the umbrella opens.
  let startY = lerp(s.rimY + s.rimHalfHeight, s.hubY, openAmount);

  // A thick brown line from that point down to the handle at (0, 0).
  // The colour array is passed straight into stroke(), the same as
  // stroke(this.srcImgSegColour) in the Week 7 Tutorial.
  stroke(brown);
  strokeWeight(9);
  line(0, startY, 0, 0);

  // The handle: a darker brown rectangle around the bottom of the shaft.
  // rect(x, y, width, height) — x = -9 and width = 18 centre it on
  // the shaft; it starts 40 px above the pivot and is 46 px tall.
  noStroke();
  fill(darkBrown);
  rect(-9, -40, 18, 46);
}

// drawTip(tipY, cream) — the small pointed tip on top of the umbrella.
//   tipY  : height of the tip
//   cream : [r, g, b] colour of the tip
function drawTip(tipY, cream) {
  noStroke();
  fill(cream);

  // A narrow triangle pointing upwards:
  //   bottom-left  (-10, tipY + 6)
  //   top point    (  0, tipY - 22)
  //   bottom-right ( 10, tipY + 6)
  // Its base sits just below tipY, so it overlaps the top of the dome.
  triangle(-10, tipY + 6, 0, tipY - 22, 10, tipY + 6);
}
