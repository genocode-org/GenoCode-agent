# Sample creatures

Sixteen GenoCode creatures to learn from. Read a few before writing your own: every one was
written in the language in [../docs/LANGUAGE.md](../docs/LANGUAGE.md).

Every sample passes the family check, `node ../tools/familycheck.mjs <file>`
([../tools/familycheck.mjs](../tools/familycheck.mjs)), which tests the golden rule: the creature
morphs, breeds and dances seamlessly. A few still have warnings, such as variants of quite different
sizes; the tables say which.

## Best models for a new creature

These show the techniques the rules ask for most clearly.

| File | What it is | Learn from it |
| --- | --- | --- |
| [Medusa.genie](Medusa.genie) | a see-through jellyfish; its variants are four other species | variants that are different species but share one structure; a pulse on the beat that also runs with no music; its own dance and background |
| [Twirla.genie](Twirla.genie) | a flower that dances like a person, with a troupe of dancers as variants | counts that grow in smoothly (`crown`, `tiers`); the `groove` function blending its own beat with the music's; `focuspoint` placed from genes; an `upright` dance |
| [Tentacles.genie](Tentacles.genie) | a ball with tentacles that are born, live and die | variants as the stages of one life; parts that appear and vanish by growing and shrinking; `random` used per tentacle |
| [Oak.genie](Oak.genie) | a realistic tree whose leaves flutter | strokes for a trunk and branches; an upright dance; a big creature that still builds fast enough |
| [Cobra.genie](Cobra.genie) | two mirrored snakes that sway and twist | a chain where every step grows, rolls and turns by gene amounts; eleven very different variants of one structure; its own dance |
| [Breeze.genie](Breeze.genie) | sprays of rings blowing round a ball | twenty variants from one short program; colours shading with height and depth |
| [Transformer.genie](Transformer.genie) | shapes scattered in waves and mirrored into all eight corners | mirroring by genes into all eight corners (`mirror_x`, …: −1 is an exact mirror); mixed shapes |
| [Flowerball.genie](Flowerball.genie) | a ball of beads that opens into a disc, crowned by petals | rings of shapes; a creature that changes form a lot across its variants (sizes vary up to 4.9×, a warning) |
| [Neuron.genie](Neuron.genie) | a nerve cell with branching dendrites in loops of field lines | branching trees built from parts (sizes vary up to 4.7×, a warning) |

## More techniques

These were fixed so they morph smoothly; each fix is a technique worth copying.

| File | What it is | Learn from it |
| --- | --- | --- |
| [Peacock.genie](Peacock.genie) | a display bird that dances its courtship display | shapes instead of strokes; `shine 0` on flat parts; a bird that turns itself to face the viewer; blending only the brightness of two colours whose hues are nearly opposite (the thighs), so the colour can't flip round the wheel |
| [Aetherion.genie](Aetherion.genie) | an abstract entity of impossible geometry | arms and rings that grow in from nothing (`shown`), with a ring still growing in starting at the outside; no dance or background block (warnings) |
| [Starfish.genie](Starfish.genie) | four arms ending in spirals of petals | petals that fan out one by one from behind the last, at full size, so no bead is ever a speck |
| [FlyingFish.genie](FlyingFish.genie) | three fish swimming in a triangle, each chasing a fly | beads and cones that grow in; a head that turns from a ball into a ring by shrinking one shape as the other grows, instead of a choice gene |
| [Greenbay.genie](Greenbay.genie) | a frond of leaves and buds | segments that come out from behind the last one at full size, so nothing shrinks to a speck; shrinking the whole frond by how much its segments grow, plus a `frond_size` gene, to keep the family the same size |
| [Monster.genie](Monster.genie) | a many-eyed monster on a ring of coral | eyes and tentacles that grow in; a tentacle that tapers away with a fixed number of balls instead of a `while` loop; an `overall` size gene |
| [Star.genie](Star.genie) | five arms of interlocking rings | an `overall` size gene that keeps far-reaching stars in the camera |
