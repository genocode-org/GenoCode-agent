<p align="center"><img src="https://raw.githubusercontent.com/genocode-org/GenoCode/main/branding/logo-lockup.svg" alt="GenoCode" width="480"></p>

# GenoCode-agent

An AI agent that designs [GenoCode](https://github.com/genocode-org/GenoCode) creatures from a
description, with Claude.

**Status: ready to use with a Claude plan.** You can design creatures with it today in Claude Code
or Claude Desktop, with no API key: see
[Using it with a Claude plan](#using-it-with-a-claude-plan-without-an-api-key). It isn't published
on npm yet. When it is, it will be `@genocode/agent`, and `genie create` will return to
[GenoCode-cli](https://github.com/genocode-org/GenoCode-cli).

## How it works

Given a description, the agent writes a `.genie` creature, checks it, draws it at a few moments to
see how it looks and moves, fixes what's wrong and saves it. Its system prompt is the
[`genocode-creatures` skill](.claude/skills/genocode-creatures/SKILL.md): the rules for making
creatures, the language docs and the sample creatures. If the description doesn't say how many
variants the creature should have, the agent asks instead of saving one. It uses Claude Opus 5.5 by
default.

## Using it with a Claude plan, without an API key

The agent's tools also come as an MCP server, so Claude Code or Claude Desktop can design creatures
and your Claude plan covers the work. No API key is needed. Claude learns the language and the rules
for making creatures from the
[`genocode-creatures` skill](.claude/skills/genocode-creatures/SKILL.md) in this repository. The
server gives it tools to check, draw, list the genes of and save a creature.

```
npm install
npm run build
```

- **Claude Code:** open this folder. It finds the server in `.mcp.json` and the skill in
  `.claude/skills`. Ask it to design a
  creature, for example "design a red ball with two wobbling antennae". Saved creatures go into this
  folder as `<Name>.genie`.
- **Claude Desktop, or Claude Code in another folder:** add a server that runs
  `node <this folder>/packages/agent/dist/mcp-cli.js --out <folder for creatures>`, and add the
  skill: copy `.claude/skills/genocode-creatures` to `~/.claude/skills`, or upload it as a zip in
  Claude Desktop. The `design_creature` prompt then starts a design from a description.

## Development

You need Node.js 22 or later (see `.nvmrc`) and Claude API credentials: set `ANTHROPIC_API_KEY`,
or run `ant auth login` once. The tests don't call the API.

```
npm install
npm run check     # build, type-check, test and check formatting, as CI does
```

The skill's `docs/` are copies of [GenoCode's docs](https://github.com/genocode-org/GenoCode/tree/main/docs).
`npm run skill-docs` copies them again after GenoCode's docs change. A workflow checks every Monday
that they're the same, and fails if they aren't.

## License

Released under the [MIT License](LICENSE). See [CREDITS.md](CREDITS.md).
