# Woman with a Parasol – interactive reinterpretation (IDEA9103, Group A)

An interactive p5.js reinterpretation of Claude Monet's *Woman with a Parasol – Madame Monet and Her Son* (1875).
Each team member owns one mechanic that changes one layer of the painting.

> Status: **Iteration 1** – the Perlin noise / randomness meadow on its own.
> The skirt (user input) and the sky (time-based) will be added by teammates.

## How to run

Open the folder in VS Code and use Live Server (*Go Live*), or open `index.html` in a browser.

Test keys (iteration 1 only):
- `1` calm wind, `2` breeze, `3` strong wind
- `R` scatter the flowers again

## Mechanic ownership

| Member | Mechanic | File |
|---|---|---|
| Lizuo Wang | Perlin noise and randomness – swaying meadow and scattered flowers | `perlin-grass.js` |
| Jiahui Zou | User input – mouse-controlled skirt | _to be added_ |
| Fei Jiang | Time-based – seasonal sky | _to be added_ |

`sketch.js` owns the canvas and calls each mechanic.

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
- **`sin()` / `cos()`** (Weeks 8, 11) turn the bend angle into the position of the blade tip and shape the hill. **`constrain()`** (Week 6) stops blades bending too far.
- **`line()`, `ellipse()`, `stroke()`, `strokeWeight()`, `fill()`, `noStroke()`** (Weeks 6, 8) draw the blades and flowers. **`beginShape()`, `vertex()`, `endShape()`** (Week 10) draw the dark ground under the grass.
- **`windowResized()` and `resizeCanvas()`** (Week 8) – positions are stored as fractions of the canvas, so the meadow rescales with the browser window.

## Key decisions

- Grass blades are two short line segments (base and tip) instead of one straight line, so they bend a little.
- The wind is not symmetric: it pushes mostly to the right, matching the blown scarf and skirt in the painting.
- Only the meadow moves; in the final version the figures, parasol and sky stay still.

## AI acknowledgement

- **Lizuo Wang** used Claude (Anthropic) to help write `perlin-grass.js`, `sketch.js` and `index.html` for iteration 1: the structure of the `GrassBlade` and `Flower` classes, the wind calculation and the layout of the project. Claude also helped check that only techniques taught in the course were used. Lizuo reads, tests and adjusts the generated code. AI-assisted code is also marked in comments at the top of each file.
- The team used ChatGPT to generate a concept image shown in the Week 9 presentation. It is not part of this project.

## External references

- Monet, C. (1875). *Woman with a Parasol – Madame Monet and Her Son*.
- Shiffman, D. (2024). *The Nature of Code*. https://natureofcode.com/
- teamLab. (2025). *Wind Form*. https://art.team-lab.cn/e/phenomena/
- Vrellis, P. (2012). *Starry Night interactive animation*. https://artof01.com/vrellis/works/starry_night.html
- p5.js library v1.9.4. https://p5js.org/
