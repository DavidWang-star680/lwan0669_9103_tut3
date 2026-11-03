# Woman with a Parasol - Ghibli-style interactive version

A p5.js project that recreates a Ghibli-style picture of a woman with a green
umbrella in a meadow. It keeps the three mechanics of our group assignment
(Woman with a Parasol, interactive): Perlin noise and randomness (Lizuo Wang), user input
(Jiahui Zou) and time-based (Fei Jiang). The little boy of the reference picture is left out.
This version replaces the earlier Monet-based picture; the documentation of that earlier
version is kept at the bottom of this file.

## How to run
Open `index.html` in a browser (or use Live Server in VS Code). The canvas is 600 x 871
(the shape of the reference picture) and shrinks to fit a smaller window.

## The three mechanics
| Mechanic | Files | What it does |
| --- | --- | --- |
| Perlin noise and randomness | `perlin-grass.js` | Lizuo Wang uses Perlin noise and randomness to create patches of varying shades of color, allowing the grass to randomly display colors between the green and yellow tones. It randomly oscillates in the default mode. Additionally, it is linked with Jiahui Zou's user input: 1. The entire grass will exhibit the same movement direction as the parasol when the mouse is swayed. 2. When the user clicks to open the parasol, flowers will grow on the grass, and the flowers also use randomness, resulting in different colors and sizes each time they grow. |
| User input | `user-input-umbrella.js` | Jiahui Zou's umbrella from the group assignment. The mouse swings it left and right (60 degrees each way). A click on the umbrella closes or opens it. Small changes for this picture (listed at the top of the file): a bigger canopy, and `display(part)` so the canopy can be drawn behind the woman and the handle in front. |
| Time-based | `time-based-sky.js` | Fei Jiang's four-season sky from the group assignment: a 50 second cycle of spring, summer, autumn and winter, with the sun, clouds, falling leaves and snow. Small changes (listed at the top of the file): seasons last twice as long, more autumn leaves and denser snow. |

`woman-figure.js` only draws the woman (noise makes her hat ribbon and skirt hem move).

Note: `perlin-clouds.js` (clouds of the earlier Monet version) is no longer loaded by `index.html` and can be deleted.
`sketch.js` is the main file: it has the only `setup()`, `draw()` and `keyPressed()`.

## How the mechanics are linked
- The umbrella moves -> the grass leans the same way (`updateGrassFromUmbrella`).
- The umbrella is open -> wildflowers grow in the meadow, each time in new random colours; closed -> they go away (`updateFlowers`).
- Layers: the umbrella canopy is drawn behind the woman when it is open and in front of her when it is closed; the handle is always in front.

## Keys
- `R`: make a new random meadow.

## Course techniques only
Every technique is tagged "(Week N)" in the comments. Nothing outside the course content is used.

## AI use
This comic-style version was completed with the assistance of Claude (Anthropic): The outlines of the female characters were drawn using code based on reference images; `perlin-grass.js` was rewritten to fit the new grass scene; The above-mentioned adjustments were made using Claude. The project structure followed the requirements of the group assignment.

---

# Documentation of the earlier Monet version

The text below documents the first version of the project (Monet's painting). It is kept for the report.
In the current version `perlin-snow.js` was removed, `perlin-clouds.js` is no longer loaded, and the
umbrella file was renamed from `user input-umberalla.js` to `user-input-umbrella.js`.

Drawing order, back to front: sky and clouds, woman, umbrella, her hand, meadow (so the grass grows in front of her dress).

## Inspiration

- Monet's brushwork: short, dense strokes of green, blue and yellow make the meadow look restless and alive. The grass colours (dark blue-green far away, yellow-green close up, some olive and blue-green strokes) are chosen to match the meadow in the painting.
- Petros Vrellis, *Starry Night* interactive animation – a still painting made of moving brushstrokes.
- teamLab, *Wind Form* – wind shown as smooth flowing motion that never repeats exactly.

## Techniques (Perlin noise and randomness – Lizuo Wang)

Every technique below was taught in the course; the Canvas module is in brackets.

- **`noise()`** (Week 8) gives every blade a smooth wind value. Subtracting a slowly growing `noiseTime` makes the wind waves roll across the meadow. Neighbouring blades get similar values, so they sway together but never identically. A second `noise()` call with each blade's own offset adds a small individual flutter.
- **`random()`** (Weeks 6 and 8) is used once, in the constructors, to choose each blade's and flower's position, height, thickness, colour and lean. These values are stored, so the layout does not flicker. `scatterFlowers()` creates a fresh random scatter.
- **`class`, `constructor`, arrays, `push()`** (Weeks 3, 7, 8) – `GrassBlade` and `Flower` objects, stored in arrays and drawn back to front in `for` loops (Week 4).
- **`map()`** (Weeks 10, 11) turns the noise value into a bend angle and makes close blades taller and thicker. **`lerp()`** (Week 11) blends colours from far to near and eases the wind strength between calm, breeze and strong.
- **`Math.sin()` / `Math.cos()`** (Week 5) turn the bend angle into the position of the blade tip. (JavaScript's `Math` versions are used, so they do not change when `angleMode(DEGREES)` is set for the clouds and the umbrella.) **`constrain()`** (Week 6) stops blades bending too far. The hill's top edge is a simple parabola.
- **Clouds (iteration 2), in `perlin-clouds.js`** – one `NoiseCloud` object per cloud, drawn with Fei's cloud shapes. `random()` (Weeks 6 and 8) chooses once each cloud's size, shape, tilt, starting place and drift speed. `noise()` (Week 8) then moves it up and down and sideways, changes its size and tilts it a little, a bit like the grass, so no cloud repeats. The `%` remainder (Week 8) makes clouds drift to the right and re-enter on the left. `scale(1, thickness)` and `translate()` (Week 11) make clouds flatter or taller. `lerp()` (Week 11) slides the season values smoothly between two seasons.
- **Clouds follow the season, one layer per season (iteration 4):** every season has its own set of random clouds. When the season changes, the old layer fades out and a new layer with new random clouds fades in. The fade is the change of season itself (the `amount` from `getSeasonBlend()` becomes the alpha), so it lasts exactly as long as the sky's colour change. The layers are objects in an array, drawn in `for` loops. Spring is the default; summer has many more clouds, they are thicker and drift fastest, and four towering storm clouds (cumulonimbus, class `StormCloud`: a dark flat base, lobes piled up like a tower and a flat top, all made from `ellipse()`); autumn has few, thin clouds that float higher; winter has fewer but thicker clouds. Each season has its own drift speed.
- **`line()`, `ellipse()`, `stroke()`, `strokeWeight()`, `fill()`, `noStroke()`** (Weeks 6, 8) draw the blades and flowers. **`beginShape()`, `vertex()`, `endShape()`** (Week 10) draw the dark ground under the grass.
- **Grass linked to the umbrella (iteration 4):** `updateGrassFromUmbrella()` measures how fast the umbrella's tilt angle changes each frame, eases it with `lerp()` (Week 11) and `constrain()` (Week 6) into a push between -1 and 1, and adds it to every blade's bend in `getBend()`. The grass leans the way the umbrella moves. When the umbrella stands still the push eases back to 0, so only the `noise()` wind is left.
- **Flowers bloom when the umbrella opens (iteration 4):** every `Flower` gets a random `bloomAt` number with `random()`. While `umbrella.isOpen` is true, `flowerBloom` grows from 0 to 1 (and shrinks again when the umbrella is closed), so flowers appear one after another and their stems and petals grow with `constrain()`. There are eight random colours (chosen with an `if / else if` chain, Week 4), and each head is five petals placed in a circle with `Math.cos()` / `Math.sin()` (Week 5) and a `for` loop (Week 4).
- **Snow (iteration 4), `perlin-snow.js`:** 260 `Snowflake` objects fill the whole sky. `random()` gives each flake its size (one in four is really big), place and falling speed; `noise()` makes each flake sway sideways while it falls; `%` (Week 8) sends it back to the top. It replaces Fei's `drawSnow()`, and uses Fei's fade-in and fade-out alpha.
- **Grass up to the horizon (iteration 4):** the grass rows nearest the horizon now have taller, thicker and lighter blades, and there are more blades in each row (130), so the edge of the hill is covered with grass tips.
- **Soft horizon (iteration 4):** `drawHorizonHaze()` draws many thin, transparent strips (`beginShape()`/`vertex()`, Week 10) along the top of the hill, in the sky colour at the horizon, so the hill melts into the sky.
- **Sun (iteration 4):** `drawCycleSun()` moves the sun slowly from the far left to the far right and starts again (`frameCount`, `%`, `lerp()`, `Math.sin()`), in every season. It is drawn before the clouds, so it is always behind them.
- **Fixed gentle wind (iteration 4):** the wind strength is now one fixed number (0.25), so the wind-level keys and `setWindLevel()` were removed.
- **Slower clouds (iteration 4):** the noise step and the drift speed of the clouds were reduced, so they move about as calmly as the grass.
- **`windowResized()` and `resizeCanvas()`** (Week 8) – positions are stored as fractions of the canvas, so the meadow rescales with the browser window.



## Techniques (Jiahui Zou – user input) and shared code


- **User input (`user input-umberalla.js`, Jiahui Zou):** Clicking the umbrella opens or closes it (`mousePressed()`, `dist()`), while moving the mouse left or right controls its tilt (`mouseX`, `map()`, `constrain()`). Both opening and swaying use `lerp()` (Week 11) to create smooth, gradual movement rather than sudden changes. The mechanic was designed to make Monet's *Woman with a Parasol* interactive while maintaining the soft, windy feeling of the original painting.

  - **Structure:** The mechanic is organised into an `Umbrella` class (Week 7), containing `toggle()`, `move()` and `display()`. This follows the update/display pattern demonstrated in the Week 11 Bauhaus Head tutorial. The class stores the umbrella's position, open/closed state, current opening amount, tilt angle, panel count and colours. `toggle()` changes the target state, `move()` updates the animation and position, and `display()` draws the umbrella. After integration with the main artwork, `setup()` and `draw()` were renamed to `setupUmbrella()` and `drawUmbrella()`, which are called from `sketch.js`. This allows the umbrella to work alongside the other mechanics while the project keeps one shared `setup()` and `draw()`.

  - **Opening and closing:** The umbrella starts open, matching the reference painting. `isOpen` stores the target state selected by clicking, while `openAmount` represents the current animation state (0 = fully closed, 1 = fully open). When the umbrella is clicked, `toggle()` uses the logical NOT operator (`!`) to switch `isOpen` between `true` and `false`. Inside `move()`, a ternary operator (`condition ? 1 : 0`) converts this Boolean into a numerical target. `lerp(this.openAmount, target, 0.08)` moves the opening amount 8% of the remaining distance towards the target each frame, producing a gradual folding or unfolding effect. `getShape()` then uses `lerp()` to calculate the canopy's width, height, rim position and hub position between their closed and open values. This allows the whole canopy to change shape smoothly rather than switching between two fixed drawings.

  - **Colour transition during opening:** The inner canopy is hidden when the umbrella is closed and becomes visible as it opens. Instead of using alpha transparency, the latest version uses `map()` and `constrain()` to convert `openAmount` into `greenAmount`, ranging from 0 to 1. `fillGreen()` uses `lerp()` (Week 11) to blend the red, green and blue values individually from cream to green. At `greenAmount = 0`, the panels match the cream outer canopy; at `greenAmount = 1`, they display their full green colour. This creates a gradual colour transition using RGB arrays and standard `fill()` values, without relying on transparency.

  - **Swaying:** Horizontal mouse movement controls the umbrella's tilt. `constrain(mouseX, 0, width)` keeps the mouse input within the canvas, while `map(mx, 0, width, -60, 60)` converts its position into an angle between -60° and +60°. Moving the mouse to the left tilts the umbrella left, and moving it to the right tilts the umbrella right. `lerp(this.angle, targetAngle, 0.15)` updates the current angle gradually, making the movement responsive but still smooth. The wider range makes the interaction easier to notice, while the easing maintains the gentle movement associated with wind.

  - **Held by the woman:** The umbrella is attached to the woman's hand rather than positioned independently on the canvas. Every frame, `move()` calls `getWomanHand()` from `woman-figure.js`, which returns the hand's `{ x, y }` coordinates. These values update the umbrella's position. In `display()`, `push()` saves the drawing state, `translate()` moves the origin to the woman's hand, `rotate()` tilts the umbrella around that point, and `scale(umbrellaScale())` adjusts its size to match the artwork. `pop()` restores the drawing state afterwards. This transformation sequence keeps the umbrella connected to the woman's hand as it moves and scales with the canvas.

  - **Clicking a tilted umbrella:** The umbrella can now lean up to 60° in either direction, so a fixed click area above the woman's hand would no longer match its position. `mousePressed()` calculates the approximate centre of the canopy using its current shape, tilt angle and distance from the hand. `sin()` and `cos()` determine the horizontal and vertical offsets of the tilted canopy, following the circular-coordinate techniques used in class. `umbrellaScale()` converts these distances into canvas pixels. The click radius is based on the current canopy width, with a minimum size so the narrow closed umbrella remains easy to select. Finally, `dist(mouseX, mouseY, centreX, centreY)` measures the distance between the mouse and canopy centre. If the distance is smaller than the hit radius, `toggle()` is called. This allows the click interaction to follow the moving umbrella.

  - **Drawing the outer canopy:** `arc()` (Week 11) creates the cream-coloured dome using the upper half of an ellipse. Its width and height are calculated from the current dimensions returned by `getShape()`. A darker cream arc is drawn on the left side, followed by a narrower cream arc that covers most of the shadow, leaving a thin crescent. This creates a simple three-dimensional appearance without using external images. The canopy's proportions were adjusted to show the umbrella from a slightly upward-looking perspective, making the green underside visible when open.

  - **Drawing the inner panels:** The inner canopy is divided into eight fabric panels, matching the structure of a traditional parasol. `getRimPoints()` uses a `for` loop, `sin()` and `cos()` to calculate evenly spaced rib endpoints around a flattened ellipse. These points are stored in an array of `{ x, y }` objects. The remainder operator `%` connects the final panel back to the first, forming a continuous canopy. `getScallop()` calculates a point between two neighbouring ribs and moves it 10% towards the centre using `lerp()`, creating a curved, scalloped fabric edge. `enlarge()` slightly expands the rim points to create a thin light-coloured border behind the green panels.

  - **Lighting and fabric folds:** Each green panel is drawn using two `triangle()` shapes, with slightly different shades to suggest folded fabric. `cos()` adjusts the brightness of each panel according to its position, creating the impression that light comes from the upper right. The remainder operator `%` is also used to alternate the shading between neighbouring panels. `fillGreen()` multiplies the base RGB values by a lighting factor and blends them with cream using `lerp()`. Thin dark-green `line()` shapes connect the centre hub to the rim points, representing the umbrella ribs. Together, the layered colours, triangles and lines create depth while using basic p5.js drawing techniques.

  - **Shaft, handle and tip:** The shaft is drawn using `line()`, while `lerp()` adjusts its starting position between the folded canopy and the inner hub as the umbrella opens. `strokeWeight()` controls the shaft thickness. A darker `rect()` forms the handle, which is positioned close to the woman's hand. A small cream `triangle()` creates the pointed tip above the canopy. These elements were kept relatively simple so the umbrella's overall appearance remains close to the painting.

- **Held by the woman:** The umbrella is connected to the woman's hand through `getWomanHand()` from the shared `woman-figure.js`. Each frame, the hand coordinates update the umbrella's position. `translate()`, `rotate()` and `scale()` keep the umbrella attached to her hand while allowing it to sway and resize with the artwork.

 - **Techniques from IDEA9103:** The mechanic combines variables, Boolean states, objects, arrays, functions, `for` loops, conditional statements, class methods and mouse events. It uses `map()`, `constrain()`, `dist()`, `sin()`, `cos()` and `lerp()` for interaction and animation, alongside `arc()`, `triangle()`, `line()`, `rect()`, `fill()` and `stroke()` for drawing. `push()`, `translate()`, `rotate()`, `scale()` and `pop()` control the umbrella's position and orientation. `angleMode(DEGREES)` is set in `sketch.js` so the rotation and trigonometric calculations use degrees.




### Key Decisions (Jiahui Zou — User Input)

- **Using techniques taught in IDEA9103:** I reviewed the umbrella code against the course materials and added comments identifying the relevant techniques and teaching weeks. The implementation combines classes, arrays, functions, loops, mouse events, transformations, trigonometry and interpolation. More complex visual effects were created by combining these techniques rather than introducing additional libraries. For example, the colour transition was changed from alpha transparency to RGB interpolation using `lerp()`, while the canopy was constructed using `arc()` and `triangle()`. I also checked the calculations and functions to ensure I could understand and explain how they worked.

- **Smooth instead of sudden:** I chose `lerp()` (Week 11) for both opening/closing and swaying because immediate changes would make the umbrella feel mechanical. The opening amount moves 8% of the remaining distance towards its target each frame, creating a gradual folding animation. The swaying interaction uses a separate easing factor to respond more quickly to mouse movement. These different movement speeds make the umbrella feel responsive while maintaining the soft, windy atmosphere of Monet's painting.

- **Based on the original painting:** I used Monet's *Woman with a Parasol* as the main reference for the umbrella's proportions, colours and perspective. The cream outer dome, green underside and subtle shadows were designed to resemble the original parasol. Instead of using a single flat shape, I constructed the canopy with eight fabric panels, lighter and darker green shades, and a scalloped edge to suggest folds and depth. I also adjusted the viewing angle to reveal more of the underside, making the opening interaction visually clearer while maintaining the painting's appearance.

- **Clearer code structure:** I organised the umbrella into one `Umbrella` class with three main methods: `toggle()`, `move()` and `display()`. Helper functions, including `getShape()`, `getRimPoints()`, `getScallop()`, `enlarge()` and `fillGreen()`, separate the calculations for shape, fabric edges and colours from the main drawing process. This makes the code easier to read, test and modify. I also removed the separate background and clouds from the earlier prototype so the umbrella could be integrated into the complete artwork, and adjusted the handle thickness to better match the reference painting.

- **Wider and faster sway (Iteration 4, with Lizuo Wang):** The original swaying range of -8° to +8° was too subtle, making the interaction difficult to notice. During the fourth iteration, we increased the range to -60° to +60° and changed the easing factor from 0.06 to 0.15. This made the umbrella follow the mouse more clearly while maintaining smooth movement. Because the umbrella could now tilt much further, the click detection was also revised using `sin()`, `cos()` and `dist()` to calculate the canopy's position and allow users to click it while tilted.

- **Joining the main sketch (Iteration 3):** The umbrella was initially developed as an independent sketch with its own `setup()` and `draw()`. To integrate it into the group project, I changed these functions to `setupUmbrella()` and `drawUmbrella()` so they could be called from the shared `sketch.js`. I also connected the umbrella to `getWomanHand()` from the shared `woman-figure.js`, allowing it to follow the woman's hand rather than remain at a fixed position. `umbrellaScale()` was used to keep the umbrella proportionate to the figure and canvas. My contribution focused on the umbrella's interaction and integration with the woman, rather than drawing the woman's figure itself.

- **Improving the visual transition:** The earlier implementation used alpha transparency to reveal the green underside as the umbrella opened. In the revised version, I replaced this with RGB colour interpolation using techniques covered in class. `map()` and `constrain()` calculate a transition value between 0 and 1, while `lerp()` blends each RGB channel from cream to green. This creates a gradual colour change without using transparency. The cream outer dome, green panels, ribs and shadow layers remain separate so their colours and appearance can be refined independently.

- **Balancing visual detail and interaction:** I wanted the umbrella to remain recognisable as part of Monet's painting while responding clearly to user input. The eight-panel structure, scalloped rim, alternating green shades and cream shadows create visual depth without relying on external images. At the same time, I kept the interaction simple: users click to open or close the umbrella and move the mouse to control its sway. This balance allows the mechanic to remain visually detailed while keeping the user interaction intuitive and easy to understand.





## Techniques (Time-based – Fei Jiang)

My mechanic creates a seasonal sky that automatically changes through spring, summer, autumn and winter.

- **Time-based animation:** `drawSky()` uses `frameCount` and conditional statements to control the repeating seasonal cycle. Each season has its own time period.

- **Sky colour transitions:** `lerpColor()` blends the colours between seasons, creating smooth transitions instead of sudden changes. Different RGB colours are used for each season.

- **Cloud shapes:** I used `ellipse()` to create cloud shapes with different sizes and colours. My original design included different cloud arrangements for each season. In the integrated project, these cloud shapes are reused by the Perlin noise cloud mechanic.

- **Moving sun:** My original `drawMovingSun()` function uses `lerp()` and `sin()` to move the sun along a curved path. The integrated version uses the updated `drawCycleSun()` function.

- **Autumn leaves:** `drawAutumnLeaves()` uses `frameCount` to control falling movement and `sin()` to make leaves sway from side to side.

- **Winter snow:** My original `drawSnow()` function uses different falling speeds and repeating positions. The integrated project uses the updated Perlin noise snowfall mechanic.

These techniques allow the sky and seasonal elements to change automatically over time without user input.

## Key decisions

- Grass blades are two short line segments (base and tip) instead of one straight line, so they bend a little.
- The wind is not symmetric: it pushes mostly to the right, matching the blown scarf and skirt in the painting.
- Only the meadow and the clouds use noise; the woman stays still and the umbrella only moves when the user clicks or moves the mouse.
- Clouds and grass share one idea: `random()` decides what each object is like, `noise()` decides how it changes over time.
- Winter clouds keep the same height as autumn clouds (the brief for the clouds only said "fewer and thicker").

## AI acknowledgement

- **Lizuo Wang** I used Claude (Anthropic) to help write `perlin-grass.js`, `sketch.js` and `index.html` for iteration 2,3,4: the structure of the `GrassBlade` and `Flower` classes, the wind calculation and the layout of the project. I reads, tests and adjusts the generated code.
  
- **Fei Jiang:** I used ChatGPT (OpenAI) to assist with developing and refining my time-based seasonal sky mechanic. ChatGPT helped with the seasonal timing, smooth colour transitions, cloud drawing, moving sun, falling leaves and snowfall animations. It also helped me understand the functions and add explanatory comments to the code. I reviewed and adjusted the code through several iterations. The AI-assisted sections are explained in the comments of my original `time-based-sky.js`.
  
- **Jiahui Zou:** I used Claude (Anthropic) to assist with specific parts of `user input-umberalla.js`, including calculating the canopy's rib positions (`getRimPoints()`), shaping the scalloped edges (`getScallop()`), blending the green colour layers (`fillGreen()`), and calculating the clickable area when the umbrella tilts using `sin()`, `cos()` and `dist()`. Claude also helped debug the code and check the techniques against the IDEA9103 course materials. I reviewed and tested each version, adjusted the umbrella's proportions, colours and movement, and refined the interaction based on the results. AI-assisted sections are identified in the source code.

## Iterations (Lizuo Wang)

1. **Iteration 1** – swaying meadow: `noise()` wind waves, random blades and flowers.
2. **Iteration 2** – clouds that move and change with `noise()` and `random()`, and follow the seasons of the time-based sky.
3. **Iteration 3** – the meadow shrinks to the bottom third of the canvas (fewer rows, shorter blades; the cloud height bands were moved up to fit); the woman and Jiahui's umbrella are added to the main sketch.
4. **Iteration 4** – the clouds move slower; the grass leans the way the umbrella moves, slowly, like a breeze (and keeps swaying with noise when it is still); no flowers at the start, they bloom in eight colours after the umbrella is opened.
   Later changes in iteration 4: cloud layers that fade in and out with each season, storm clouds in summer, faster summer clouds, a soft horizon, a sun that crosses the sky in every season.



### Iterations (Jiahui Zou – user input)

- **Iteration 1 – the parasol on its own:** a separate sketch (`setup()` / `draw()`, 800 × 600 canvas). Clicking opens or closes the parasol and moving the mouse tilts it -8°…+8°, both eased with `lerp()` (Week 11). Every function was checked against the Canvas course pages and things not taught were replaced (angles in degrees with `angleMode(DEGREES)` instead of `PI` / `HALF_PI` / `PIE`, a plain `rect()`, and normal functions with parameters instead of methods called with `this.`). The canopy is a cream dome with a shadow, a cream border and green panels with simple lighting from `cos()`. All comments are in English with `(Week N)` tags.
- **Iteration 2 – thinner handle, colour layers, no transparency:** the handle was made thinner (18 → 12 pixels wide), and the canopy got a light green edge, lit and alternating panels, a fold down each panel and a scalloped rim. The 4-value `fill(r, g, b, alpha)` was not shown in class, so the panels now change from cream to green with `lerp()` (Week 11) as the parasol opens, instead of fading in with transparency.
- **Iteration 3 – matching the painting:** the canopy was resized from a reference image of Monet's scene (rim half-width 290 → 220, a taller canopy with the ribs meeting near the tip, tip at -510). The canvas now fills the browser window (`windowWidth` × `windowHeight`), and the parasol stands where the woman's hand is in the picture (566, 588 in picture units of 1041 × 1511), scaled with `scale()` and `min()` so it resizes with the window.
- **Iteration 4 – joined to the main sketch (with Lizuo Wang):** `setup()` / `draw()` became `setupUmbrella()` / `drawUmbrella()`; `createCanvas()`, `background()` and `angleMode()` moved to `sketch.js`. The parasol follows the woman's hand (`getWomanHand()` in `woman-figure.js`) and is scaled with `umbrellaScale()`. The sway is wider and faster (-60°…+60°, easing 0.06 → 0.15), and `mousePressed()` uses `sin()` / `cos()` (Week 11) to find the canopy when it leans. The colour change uses `lerp()` inside a normal 3-value `fill()` / `stroke()` (Week 6), so no transparency is used.
- **Iteration 5 – tidied comments and simpler code:** the file's comments were rewritten in the same layout as `perlin-grass.js` (a header with the AI note, the changes for joining and how the file fits with `sketch.js`, then numbered sections), and every technique is tagged with its `(Week N)`. The ternary `? :` was replaced with a plain `if` (Week 4). The code works and looks exactly the same as before.
 

## External references

- Monet, C. (1875). *Woman with a Parasol – Madame Monet and Her Son*.
- Shiffman, D. (2024). *The Nature of Code*. https://natureofcode.com/
- teamLab. (2025). *Wind Form*. https://art.team-lab.cn/e/phenomena/
- Vrellis, P. (2012). *Starry Night interactive animation*. https://artof01.com/vrellis/works/starry_night.html
- p5.js library v1.9.4. https://p5js.org/
