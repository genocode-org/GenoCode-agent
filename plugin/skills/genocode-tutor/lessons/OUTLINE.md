# The GenoCode course

Ten lessons, then a creature of the learner's own. Each lesson builds on the ones before it. The
section numbers are in [LANGUAGE.md](../docs/LANGUAGE.md); the examples are in
[examples/](../examples/README.md).

Each exercise is set in words. The learner writes the code; see the rules in
[SKILL.md](../SKILL.md).

## 1. The turtle and a first creature

- **Covers:** `creature`, comments, `shape`, `lay`, `forward`, `back`, `pitch`, `yaw`, `roll`,
  `repeat`
- **Read:** GETTING_STARTED.md, "The app" and "A first creature"; sections 2, 11.1–11.3
- **Exercise:** a tower of five cubes standing straight up. Then make it lean to one side.
- **Common mistakes:** the turtle starts facing the viewer, so a first cone points at you; positive
  `pitch` tips the nose down (11.9)

## 2. Size

- **Covers:** `grow` with a number and with a vector, `lay { … }`, the shape transform
- **Read:** sections 11.4, 11.7
- **Exercise:** a caterpillar of balls that get smaller towards the tail, with one flattened ball
  for a head
- **Common mistakes:** growing makes later moves longer too; `grow` outside `lay { }` changes
  everything after it, not just the next shape (11.9)

## 3. Loops, variables and choices

- **Covers:** `repeat … as i`, `for … from … to … by`, `while`, `let`, `if` / `else`, `%`
- **Read:** sections 7, 8.1, 9
- **Exercise:** a ring of eight balls, made by turning the turtle between them; then make every
  other ball a cube
- **Common mistakes:** `i` counts from 0; conditions must be true or false, so `if 1` is an error;
  there is no `break`

## 4. Colour and material

- **Covers:** colour names, `hsv`, `colour`, `shine`, `sharpness`, `gradient`, `spectrum`
- **Read:** sections 13.1–13.3
- **Study:** [Breeze.genie](../examples/Breeze.genie), colours shading with
  height and depth
- **Exercise:** colour lesson 3's ring with a gradient, one colour per ball
- **Common mistakes:** a gradient is sampled with a position from 0 to 1, so divide the loop
  counter by the last value it reaches

## 5. Genes

- **Covers:** `gene … in … step …`, colour genes, gene descriptions, the gene sliders, **Breed**
- **Read:** GETTING_STARTED.md, "Genes"; sections 6.1–6.4, 19.1–19.2
- **Exercise:** turn lesson 4's ring into a family: genes for the number of balls, their size and
  the colours. Move the sliders, then breed a grid of rings.
- **Common mistakes:** a gene's value must lie inside its range; values and bounds must be
  constants, not variables

## 6. Branches and symmetry

- **Covers:** `branch`, `symmetric`, `side`, `mirror`
- **Read:** sections 11.5, 11.6
- **Study:** [Transformer.genie](../examples/Transformer.genie), mirroring by
  genes
- **Exercise:** a body with two arms that mirror each other, written once with `symmetric x`
- **Common mistakes:** without a `branch`, the turtle stays where the arm left it

## 7. Parts and functions

- **Covers:** `part`, parameters, part genes, `function`, `return`
- **Read:** GETTING_STARTED.md, "Parts"; sections 10, 6.5
- **Study:** [Neuron.genie](../examples/Neuron.genie), branching built from
  parts
- **Exercise:** a creature with four legs, each drawn by one `leg` part with its own genes
- **Common mistakes:** a function calculates a value and must not lay shapes or move the turtle;
  a part that moves the turtle moves it for everything after the call (section 20)

## 8. Variants and morphing

- **Covers:** `variant`, **Morph**, making variants blend smoothly
- **Read:** GETTING_STARTED.md, "Variants, morphing and dancing"; sections 6.6, 19.3
- **Study:** [Tentacles.genie](../examples/Tentacles.genie), variants as the
  stages of one life
- **Exercise:** two variants of the lesson 7 creature; watch them in **Morph** and fix anything that
  pops in or out
- **Common mistakes:** changing a count makes shapes appear or vanish suddenly; grow them in from
  small instead

## 9. Time, music and dance

- **Covers:** `time`, `beat`, `music.bass` and the other music values, `dance { }`, **Dance**
- **Read:** sections 16, 17
- **Study:** [Medusa.genie](../examples/Medusa.genie), a pulse on the beat
  that also runs with no music
- **Exercise:** make the creature swell with the bass and sway with time, so it still moves with no
  music playing
- **Common mistakes:** every music value is 0 when no music plays; `music.note` is a hue and wraps
  from 360 to 0

## 10. Strokes, textures and backgrounds

- **Covers:** `stroke { }`, `texture`, `pattern`, `background { }`, **Patterns**
- **Read:** sections 12.1, 14, 15
- **Study:** [Oak.genie](../examples/Oak.genie), strokes for a trunk and
  branches
- **Exercise:** give the creature a tail drawn as one stroke, a texture and a background
- **Common mistakes:** inside `stroke { }`, `lay` adds a point to the tube instead of laying a
  shape

## Your own creature

The learner designs and writes a creature of their own, using what the lessons covered. Offer three
levels to choose from:

- **Easy:** TODO
- **Medium:** TODO
- **Above medium:** TODO

Check each step with them, as in the lessons, and when it's done, help them save it (**File ›
Download .genie…**) and record a video of it dancing.
