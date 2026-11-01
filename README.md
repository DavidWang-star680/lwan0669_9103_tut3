# Woman with a Parasol – interactive reinterpretation (IDEA9103, Group A)

An interactive p5.js reinterpretation of Claude Monet's *Woman with a Parasol – Madame Monet and Her Son* (1875).
Each team member owns one mechanic that changes one layer of the painting.

> Status: **Iteration 3** – the meadow (now only the bottom third of the canvas), the noise clouds, the seasonal sky, the woman and the umbrella all run together in one sketch.
> Click the umbrella to open or close it (flowers bloom while it is open); move the mouse to tilt it (the grass leans the same way).

## How to run

Open the folder in VS Code and use Live Server (*Go Live*), or open `index.html` in a browser.

Test keys (temporary):
- `R` scatter the flowers and the clouds again

The wind is always a gentle breeze (the lowest level), so the keys `1`, `2` and `3` were removed. The seasons change by themselves: spring, summer, autumn, winter, then spring again (about 4000 frames, roughly 67 seconds; the season clock runs at 37.5% of the first speed, so every season and every change between seasons lasts 2.7 times longer than at first).

## Mechanic ownership

| Member | Mechanic | File |
|---|---|---|
| Lizuo Wang | Perlin noise and randomness – swaying meadow, scattered flowers, noise-driven clouds and snow | `perlin-grass.js`, `perlin-clouds.js`, `perlin-snow.js` |
| Jiahui Zou | User input – umbrella that opens / closes on click and tilts with the mouse | `user input-umberalla.js` |
| Fei Jiang | Time-based – seasonal sky, sun, leaves and snow, and the cloud shapes | `time-based-sky.js` |

**Shared code (not one person's mechanic):** `sketch.js` owns the canvas and calls each mechanic; `woman-figure.js` draws the woman's body and tells the umbrella where her hand is; `index.html` loads the files.

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

## Techniques (Jiahui Zou - user input) and shared code

- **User input (`user input-umberalla.js`, Jiahui Zou):** clicking the umbrella opens or closes it (`mousePressed()`, `dist()`), and moving the mouse left or right tilts it (`mouseX`, `map()`, `constrain()`). Both changes are eased with `lerp()` (Week 11), so nothing jumps. Jiahui should check and extend this section with his own wording.
- **Woman's body (`woman-figure.js`, shared code):** drawn in a soft Ghibli-like style from a reference picture: straw hat with a blue ribbon, short hair, a face with eyes, a smile and blush, a white dress with a high collar, puffy sleeves, a blue sash and a long skirt blowing to the right. Smooth outlines are made by a small helper `curveVerts()` that places `vertex()` points along a curve with `lerp()` (Week 11) inside a `for` loop (Week 4); the rest uses `beginShape()`/`vertex()` (Week 10), `ellipse()`, `arc()`, `rect()`, `line()`, `triangle()`, `rotate()` and `push()`/`translate()`/`scale()`/`pop()` (Weeks 6, 8, 11), so she scales with the window. `getWomanHand()` returns an `{ x, y }` object (Week 4) that tells the umbrella where to be held.
  
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

- **Lizuo Wang** used Claude (Anthropic) to help write `perlin-grass.js`, `sketch.js` and `index.html` for iteration 1: the structure of the `GrassBlade` and `Flower` classes, the wind calculation and the layout of the project. Claude also helped check that only techniques taught in the course were used. Lizuo reads, tests and adjusts the generated code. AI-assisted code is also marked in comments at the top of each file.
- **Iteration 2:** Lizuo used Claude (Anthropic) to write `perlin-clouds.js` (the `NoiseCloud` class and the season blending), to join `time-based-sky.js` to the main sketch (its `setup()` and `draw()` were moved or renamed so there is only one of each in the project, and its fixed season cloud calls were replaced by `drawNoiseClouds()`), and to rewrite `sketch.js` and `index.html` so the sky, clouds and meadow run together. Fei's own code is unchanged apart from those edits, which are listed in the comment at the top of `time-based-sky.js`.
- **Iteration 4:** Lizuo used Claude (Anthropic) to write the link between the umbrella and the meadow (`updateGrassFromUmbrella()`, `updateFlowers()`, the flower colours and petals) and to slow down the clouds.
- **Iteration 3:** Lizuo used Claude (Anthropic) to write `woman-figure.js` (the shared woman's body), to join Jiahui's umbrella file to the main sketch (his `setup()` / `draw()` became `setupUmbrella()` / `drawUmbrella()`, the fixed canvas and background were removed, the umbrella now follows the woman's hand and is scaled, and `mousePressed()` takes the scale into account; listed in the comment at the top of his file), and to retune `perlin-grass.js` and `perlin-clouds.js` for the smaller meadow.
- **Iteration 4 (cloud layers, sun, horizon):** Lizuo used Claude (Anthropic) to rewrite `perlin-clouds.js` with season layers and the `StormCloud` class, to write `drawHorizonHaze()` in `perlin-grass.js` and `drawCycleSun()` in `time-based-sky.js` (Fei's old `drawMovingSun()` is no longer called; noted in the file's header).
- **Iteration 4 (snow, season length):** Lizuo used Claude (Anthropic) to write `perlin-snow.js`, to tie the cloud fade to the season change, to make the seasons longer (one line in `time-based-sky.js`, plus the `drawNoiseSnow()` calls that replace `drawSnow()`) and to thicken the grass at the horizon.
- **Iteration 4 (later):** Lizuo used Claude (Anthropic) to redraw the woman in more detail (`woman-figure.js`), to slow the grass's reaction to the umbrella, to remove the wind-level keys and to slow the season clock in `time-based-sky.js` (one line, noted in its header).
- The team used ChatGPT to generate a concept image shown in the Week 9 presentation. It is not part of this project.
  
- **Fei Jiang:** I used ChatGPT (OpenAI) to assist with developing and refining my time-based seasonal sky mechanic. ChatGPT helped with the seasonal timing, smooth colour transitions, cloud drawing, moving sun, falling leaves and snowfall animations. It also helped me understand the functions and add explanatory comments to the code. I reviewed and adjusted the code through several iterations. The AI-assisted sections are explained in the comments of my original `time-based-sky.js`.

## Iterations (Lizuo Wang)

1. **Iteration 1** – swaying meadow: `noise()` wind waves, random blades and flowers.
2. **Iteration 2** – clouds that move and change with `noise()` and `random()`, and follow the seasons of the time-based sky.
3. **Iteration 3** – the meadow shrinks to the bottom third of the canvas (fewer rows, shorter blades; the cloud height bands were moved up to fit); the woman and Jiahui's umbrella are added to the main sketch.
4. **Iteration 4** – the clouds move slower; the grass leans the way the umbrella moves, slowly, like a breeze (and keeps swaying with noise when it is still); no flowers at the start, they bloom in eight colours after the umbrella is opened.
   Later changes in iteration 4: cloud layers that fade in and out with each season, storm clouds in summer, faster summer clouds, a soft horizon, a sun that crosses the sky in every season.

## External references

- Monet, C. (1875). *Woman with a Parasol – Madame Monet and Her Son*.
- Shiffman, D. (2024). *The Nature of Code*. https://natureofcode.com/
- teamLab. (2025). *Wind Form*. https://art.team-lab.cn/e/phenomena/
- Vrellis, P. (2012). *Starry Night interactive animation*. https://artof01.com/vrellis/works/starry_night.html
- p5.js library v1.9.4. https://p5js.org/
