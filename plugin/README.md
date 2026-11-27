# GenoCode

Design [GenoCode](https://github.com/genocode-org/GenoCode) creatures with Claude. GenoCode is a
small language for 3D creatures that dance to music. Values marked as genes can be mutated, bred and
morphed, so one program describes a whole family of creatures.

Describe a creature, for example "design a red ball with two wobbling antennae", and Claude writes
it in GenoCode, checks it, draws it, fixes what's wrong and saves it as a `.genie` file. Open the
file in the [GenoCode app](https://genocode.piorek.co.za/app/) to watch it move, morph, breed and
dance. No API key is needed.

## Install in Claude Code

```
/plugin install genocode --marketplace genocode-org/GenoCode-agent
```

Then restart Claude Code and type `/mcp` to check that `genocode` is in the list of servers.

## What's in the plugin

- **The `genocode-creatures` skill** teaches Claude the language and the rules for making
  creatures: the language definition, a reference of every statement and function, a getting
  started guide, 16 example creatures and a starter template.
- **The `genocode-tutor` skill** teaches you to write GenoCode yourself, in ten lessons from a
  first creature to music and dance. Claude explains each idea, sets an exercise, and checks your
  code with hints rather than writing it for you.
- **The `genocode` MCP server** gives Claude tools to work with creatures:
  - `check_creature`: errors and warnings from the GenoCode checker
  - `render_creature`: draws the creature as a picture
  - `list_genes`: lists the creature's genes
  - `check_family`: checks that the creature and its variants morph smoothly
  - `save_creature`: saves the creature as a `.genie` file

## What it runs

- The MCP server runs on your computer with `npx -y @genocode/agent@0.2.0`, from
  [npm](https://www.npmjs.com/package/@genocode/agent). Its source is in this repository under
  `packages/agent`. It needs [Node.js](https://nodejs.org) 22 or later.
- The server makes no network requests and collects no data. It writes only the `.genie` files you
  ask Claude to save, into the folder Claude Code was started in.
- When Claude has a shell, the skill may ask it to install the `genie` command line
  ([@genocode/cli](https://www.npmjs.com/package/@genocode/cli)) and
  [@genocode/core](https://www.npmjs.com/package/@genocode/core) from npm, to check creatures.

## License

MIT
