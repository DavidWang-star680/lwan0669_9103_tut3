# Woman with a Parasol – interactive reinterpretation (IDEA9103, Group A)

An interactive p5.js reinterpretation of Claude Monet's *Woman with a Parasol – Madame Monet and Her Son* (1875).
Each team member owns one mechanic that changes one layer of the painting.

> Status: **Iteration 3** – the meadow (now only the bottom third of the canvas), the noise clouds, the seasonal sky, the woman and the umbrella all run together in one sketch.
> Click the umbrella to open or close it; move the mouse to tilt it.

## How to run

Open the folder in VS Code and use Live Server (*Go Live*), or open `index.html` in a browser.

Test keys (temporary):
- `1` calm wind, `2` breeze, `3` strong wind
- `R` scatter the flowers and the clouds again

The seasons change by themselves: spring, summer, autumn, winter, then spring again (a 1500-frame cycle, about 25 seconds).

## Mechanic ownership

| Member | Mechanic | File |
|---|---|---|
| Lizuo Wang | Perlin noise and randomness – swaying meadow, scattered flowers, and noise-driven clouds | `perlin-grass.js`, `perlin-clouds.js` |
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
- **Clouds follow the season** (the season clock is Fei's `seasonFrame`): spring is the default; summer has more clouds and they are thicker; autumn has fewer, thinner clouds that float higher; winter has even fewer clouds than autumn, but they are thicker. Clouds fade in and out when the cloud cover passes their rank, and the biggest clouds are the last to disappear.
- **`line()`, `ellipse()`, `stroke()`, `strokeWeight()`, `fill()`, `noStroke()`** (Weeks 6, 8) draw the blades and flowers. **`beginShape()`, `vertex()`, `endShape()`** (Week 10) draw the dark ground under the grass.
- **`windowResized()` and `resizeCanvas()`** (Week 8) – positions are stored as fractions of the canvas, so the meadow rescales with the browser window.

## Techniques (Jiahui Zou - user input) and shared code

- **User input (`user input-umberalla.js`, Jiahui Zou):** clicking the umbrella opens or closes it (`mousePressed()`, `dist()`), and moving the mouse left or right tilts it (`mouseX`, `map()`, `constrain()`). Both changes are eased with `lerp()` (Week 11), so nothing jumps. Jiahui should check and extend this section with his own wording.
- **Woman's body (`woman-figure.js`, shared code):** drawn with simple shapes (`beginShape()`/`vertex()` Week 10, `ellipse()`, `rect()`, `line()`) inside `push()`/`translate()`/`scale()`/`pop()` (Weeks 8, 11), so she scales with the window. `getWomanHand()` returns an `{ x, y }` object (Week 4) that tells the umbrella where to be held.

## Key decisions

- Grass blades are two short line segments (base and tip) instead of one straight line, so they bend a little.
- The wind is not symmetric: it pushes mostly to the right, matching the blown scarf and skirt in the painting.
- Only the meadow and the clouds use noise; the woman stays still and the umbrella only moves when the user clicks or moves the mouse.
- Clouds and grass share one idea: `random()` decides what each object is like, `noise()` decides how it changes over time.
- Winter clouds keep the same height as autumn clouds (the brief for the clouds only said "fewer and thicker").

## AI acknowledgement

- **Lizuo Wang** used Claude (Anthropic) to help write `perlin-grass.js`, `sketch.js` and `index.html` for iteration 1: the structure of the `GrassBlade` and `Flower` classes, the wind calculation and the layout of the project. Claude also helped check that only techniques taught in the course were used. Lizuo reads, tests and adjusts the generated code. AI-assisted code is also marked in comments at the top of each file.
- **Iteration 2:** Lizuo used Claude (Anthropic) to write `perlin-clouds.js` (the `NoiseCloud` class and the season blending), to join `time-based-sky.js` to the main sketch (its `setup()` and `draw()` were moved or renamed so there is only one of each in the project, and its fixed season cloud calls were replaced by `drawNoiseClouds()`), and to rewrite `sketch.js` and `index.html` so the sky, clouds and meadow run together. Fei's own code is unchanged apart from those edits, which are listed in the comment at the top of `time-based-sky.js`.
- **Iteration 3:** Lizuo used Claude (Anthropic) to write `woman-figure.js` (the shared woman's body), to join Jiahui's umbrella file to the main sketch (his `setup()` / `draw()` became `setupUmbrella()` / `drawUmbrella()`, the fixed canvas and background were removed, the umbrella now follows the woman's hand and is scaled, and `mousePressed()` takes the scale into account; listed in the comment at the top of his file), and to retune `perlin-grass.js` and `perlin-clouds.js` for the smaller meadow.
- The team used ChatGPT to generate a concept image shown in the Week 9 presentation. It is not part of this project.

## Iterations (Lizuo Wang)

1. **Iteration 1** – swaying meadow: `noise()` wind waves, random blades and flowers.
2. **Iteration 2** – clouds that move and change with `noise()` and `random()`, and follow the seasons of the time-based sky.
3. **Iteration 3** – the meadow shrinks to the bottom third of the canvas (fewer rows, shorter blades; the cloud height bands were moved up to fit); the woman and Jiahui's umbrella are added to the main sketch.

## External references

- Monet, C. (1875). *Woman with a Parasol – Madame Monet and Her Son*.
- Shiffman, D. (2024). *The Nature of Code*. https://natureofcode.com/
- teamLab. (2025). *Wind Form*. https://art.team-lab.cn/e/phenomena/
- Vrellis, P. (2012). *Starry Night interactive animation*. https://artof01.com/vrellis/works/starry_night.html
- p5.js library v1.9.4. https://p5js.org/
