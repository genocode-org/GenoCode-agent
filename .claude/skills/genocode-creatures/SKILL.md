---
name: genocode-creatures
description: Design and write GenoCode creatures (.genie files). Use when asked to create, improve, fix or add variants to a GenoCode creature, or to write .genie code.
---

# Making GenoCode creatures

GenoCode is a small language for 3D creatures that dance to music. A creature is a program that
drives a turtle laying simple shapes (balls, cubes, cones, tubes, rings, donuts and strokes). Values
marked as **genes** can be mutated, bred and morphed, so one program describes a whole family of
creatures. **Variants** are other sets of gene values for the same program; the creature and its
variants form the loop the app morphs through while the creature dances.

This skill is for any AI agent (Claude, Gemini, ChatGPT and others) asked to make a GenoCode
creature. It works with or without a shell: with one, check your work with the tools below; without
one, follow the rules carefully and hand the file to the user to open in the app.

## The rules

There are only three rules. Everything else about a creature is decided by what the user asks for.

1. **If there are variants, they blend smoothly.** The creature and each variant morph smoothly
   into the next and back to the first: nothing pops in or out, jumps or flashes to another colour
   on the way. How to make sure of that is under [Making variants blend](#making-variants-blend).
2. **If the creature must behave in a certain way, add a dance to it.** Put that behaviour in a
   `dance { }` block. If the request asks for no particular behaviour, leave the dance out.
3. **If the request doesn't say how many variants, ask.** Ask the user before writing the creature;
   don't choose a number yourself.

## What's in this skill

| Path | What it is |
| --- | --- |
| [docs/LANGUAGE.md](docs/LANGUAGE.md) | the language definition: the final word on what the language means |
| [docs/REFERENCE.md](docs/REFERENCE.md) | every statement, function, input and constant, with an example |
| [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) | a short guide: a first creature, genes, parts, variants |
| [examples/](examples/README.md) | 16 sample creatures, and what each one teaches |
| [templates/Starter.genie](templates/Starter.genie) | a small example creature with variants and a dance |
| [tools/familycheck.mjs](tools/familycheck.mjs) | checks that variants morph smoothly (its other sections are information) |

The docs are copies. The originals, always up to date, are in the
[GenoCode repository](https://github.com/genocode-org/GenoCode) under `docs/`, and the starter
creatures under `creatures/`.

## GenoCode on GitHub and npm

| What | GitHub | npm |
| --- | --- | --- |
| The language, the app and the starter creatures | [genocode-org/GenoCode](https://github.com/genocode-org/GenoCode) | [@genocode/core](https://www.npmjs.com/package/@genocode/core), [@genocode/render](https://www.npmjs.com/package/@genocode/render) |
| `genie`, the command line | [genocode-org/GenoCode-cli](https://github.com/genocode-org/GenoCode-cli) | [@genocode/cli](https://www.npmjs.com/package/@genocode/cli) |
| The VS Code extension, with a live preview | [genocode-org/GenoCode-vscode](https://github.com/genocode-org/GenoCode-vscode) | |

The web app, to view, morph, breed and dance a creature: <https://genocode.piorek.co.za/app/>.

## How to work

1. **Read first.** Read [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md), then in
   [docs/LANGUAGE.md](docs/LANGUAGE.md) the sections the creature needs; 11.9 (common surprises)
   always helps. Look things up in [docs/REFERENCE.md](docs/REFERENCE.md) as you write. **Use only
   what the docs describe.** Don't guess syntax from other languages: `for i from 0 to 7`, not
   `for i in 0..7`.
2. **Ask** how many variants the user wants, if the request doesn't say (rule 3).
3. **Write the creature** the user asked for. [templates/Starter.genie](templates/Starter.genie) and
   [examples/](examples/README.md) show how the language is used; don't copy their variants, dance
   or other features unless the request calls for them.
4. **Check it** (with a shell):

   ```
   npm install -g @genocode/cli           # once: the genie command
   genie check My.genie                   # errors and warnings; fix every one
   genie jumps My.genie                   # colours that jump while morphing between variants
   cd tools && npm install && cd ..       # once: @genocode/core for the family check
   node tools/familycheck.mjs My.genie    # morph loop checks (other sections are information)
   ```

5. **Look at it.** `genie render` draws a picture: look at it, and at each variant if there are
   any, and compare them with what was asked for.

   ```
   genie render My.genie rest.png
   genie render --variant=Bud My.genie bud.png
   genie render --views My.genie sides.png
   ```

6. **Hand it over** as one `.genie` file, with a short summary of what it is. Without a shell, say
   that the file hasn't been checked and tell the user to open it in the app
   (**File › Open a .genie file**).

## Making variants blend

Only needed when the creature has variants (rule 1). Morphing blends gene values, so:

- **One structure.** The creature and every variant lay the same shapes, in the same order.
  Variants differ in sizes, angles, colours, lengths and amounts, never in how many of something
  there are. To show more of a part in one variant, build the most there can be and let a number
  gene grow or shrink the extra ones.
- **Choice and true/false genes are the same in every variant.** They switch at the halfway point
  of a morph, so the creature would jump there.
- **Colour ranges no wider than needed.** Hue moves along the gene's range; a whole-circle range
  can swing a colour the long way round. `genie jumps` finds these.
- **Speeds are the same in every variant.** A gene multiplied by `time` (a turning speed, a
  tempo) that differs between variants makes parts whirl round during a morph.
