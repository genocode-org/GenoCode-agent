<p align="center"><img src="https://raw.githubusercontent.com/genocode-org/GenoCode/main/branding/logo-lockup.svg" alt="GenoCode" width="480"></p>

# GenoCode-agent

An AI agent that designs [GenoCode](https://github.com/genocode-org/GenoCode) creatures from a
description, with Claude.

Describe a creature, and Claude writes it in GenoCode, checks it, draws it, fixes what's wrong and
saves it as a `.genie` file. Open it in the [GenoCode app](https://genocode.piorek.co.za/app/) to
watch it move, morph, breed and dance.

With Claude Code or Claude Desktop, your Claude plan covers the work, so no API key is needed.

## Claude Code

Add the GenoCode plugin, in Claude Code:

```
/plugin marketplace add genocode-org/GenoCode-agent
/plugin install genocode@genocode
```

Then, in any folder, ask Claude to design a creature, for example "design a red ball with two
wobbling antennae". It saves the creature in that folder. You need
[Node.js](https://nodejs.org) 22 or later.

## Claude Desktop

1. Download `genocode.mcpb` from the
   [latest release](https://github.com/genocode-org/GenoCode-agent/releases/latest) and open it.
   Claude Desktop asks you to install the GenoCode extension, and which folder to save creatures
   in.
2. Download `genocode-creatures.zip` from the same release, and upload it in Claude Desktop's
   settings, under skills. The skill teaches Claude the language and the rules for making
   creatures.
3. Ask Claude to design a creature.

## Other ways

- **Any app that runs MCP servers:** run `npx -y @genocode/agent`. Saved creatures go into the
  folder it's started in, or the folder given with `--out <folder>`. Give the app the skill from
  `genocode-creatures.zip` too, if it takes skills.
- **Your own program, with the Claude API:** `designCreature({ description })` from
  [`@genocode/agent`](https://www.npmjs.com/package/@genocode/agent) designs a creature on its own
  and returns it. It needs Claude API credentials: set `ANTHROPIC_API_KEY`, or run
  `ant auth login` once. It uses Claude Opus 5.5 by default.

## What's inside

- [`plugin/skills/genocode-creatures`](plugin/skills/genocode-creatures/SKILL.md): the skill. It
  holds the rules for making creatures, the language docs and sample creatures.
- [`packages/agent`](packages/agent): `@genocode/agent`. It's the MCP server, with tools to check,
  draw (a variant, or from several sides), list the genes of, family-check and save a creature, and
  `designCreature` for the Claude API, whose system prompt is the whole skill.
- [`plugin`](plugin): the Claude Code plugin, listed by
  [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).
- [`desktop`](desktop): the Claude Desktop extension's manifest.

## Development

You need Node.js 22 or later (see `.nvmrc`). The tests don't call the Claude API.

```
npm install
npm run check     # build, type-check, test and check formatting, as CI does
```

Claude Code opened in this folder uses the server you built, from `.mcp.json`, and the skill, from
`.claude/skills`. That's a link to `plugin/skills`, so you're trying out the version you're working
on.

To release, put the new version in `packages/agent/package.json`,
`plugin/.claude-plugin/plugin.json` (twice: `version`, and the server's `@genocode/agent@…`) and
`desktop/manifest.json`, then push a tag such as `v0.2.0`. The release workflow publishes the
package to npm, where it waits for approval, and makes a GitHub release with `genocode.mcpb` and
`genocode-creatures.zip`. `node scripts/release-files.mjs` builds those two files locally, after
`npm run build`.

The skill's `docs/` are copies of [GenoCode's docs](https://github.com/genocode-org/GenoCode/tree/main/docs).
`npm run skill-docs` copies them again after GenoCode's docs change. A workflow checks every Monday
that they're the same, and fails if they aren't.

## License

Released under the [MIT License](LICENSE). See [CREDITS.md](CREDITS.md).
