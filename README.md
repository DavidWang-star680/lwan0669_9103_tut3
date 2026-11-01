# Woman with a Parasol - Ghibli-style test version

A p5.js test project that recreates a Ghibli-style picture of a woman with a green
umbrella in a meadow. It uses the same three mechanics as the group assignment
(Woman with a Parasol, interactive). The little boy of the reference picture is left out.
This folder is separate from the assignment folder; nothing there was changed.

## How to run
Open `index.html` in a browser (or use Live Server in VS Code). The canvas is 600 x 871
(the shape of the reference picture) and shrinks to fit a smaller window.

## The three mechanics
| Mechanic | Files | What it does |
| --- | --- | --- |
| Perlin noise and randomness | `perlin-grass.js` | A noise wind rolls over the meadow; noise makes soft patches of greener or yellower grass; every blade and flower gets random sizes, colours and positions. |
| User input | `user-input-umbrella.js` | Jiahui Zou's umbrella from the group assignment, copied over without any change. The mouse swings it left and right (60 degrees each way). A click on the umbrella closes or opens it. |
| Time-based | `time-based-sky.js` | Fei Jiang's four-season sky from the group assignment, copied over without any change: a 50 second cycle of summer, spring, autumn and winter, with the sun, clouds, falling leaves and snow. |

`woman-figure.js` only draws the woman (noise makes her hat ribbon and skirt hem move).

Note: `perlin-clouds.js` is a leftover of an earlier version. It is no longer loaded by `index.html` and can be deleted.
`sketch.js` is the main file: it has the only `setup()`, `draw()` and `keyPressed()`.

## How the mechanics are linked
- The umbrella moves -> the grass leans the same way (`updateGrassFromUmbrella`).
- The umbrella is open -> buttercups grow in the meadow; closed -> they go away (`updateFlowers`).

## Keys
- `R`: make a new random meadow and new clouds.

## Course techniques only
Every technique is tagged "(Week N)" in the comments. Nothing outside the course content is used.

## AI use
Written with the help of Claude (Anthropic). The shapes were drawn by hand in code from a
reference picture; the structure follows the group assignment.
