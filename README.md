<p align="center"><img src="https://raw.githubusercontent.com/genocode-org/GenoCode/main/branding/logo-lockup.svg" alt="GenoCode" width="480"></p>

# GenoCode-agent

An AI agent that designs [GenoCode](https://github.com/genocode-org/GenoCode) creatures from a
description, with Claude.

Describe a creature, and Claude writes it in GenoCode, checks it, draws it, fixes what's wrong and
saves it as a `.genie` file. Open it in the [GenoCode app](https://genocode.piorek.co.za/app/) to
watch it move, morph, breed and dance.

With Claude Code or Claude Desktop, your Claude plan covers the work, so no API key is needed.

## Install in Claude Code

You need [Claude Code](https://claude.com/claude-code) and [Node.js](https://nodejs.org) 22 or
later. Check your Node.js version with `node --version`.

1. Start Claude Code, in any folder: run `claude`.
2. Add the GenoCode plugin list, then install the plugin from it:

   ```
   /plugin marketplace add genocode-org/GenoCode-agent
   /plugin install genocode@genocode
   ```

3. Restart Claude Code. Type `/mcp` to check: `genocode` should be in the list of servers.
4. Ask for a creature, for example "design a red ball with two wobbling antennae". Claude may ask
   you a question first, such as how many variants you want. It saves the creature as a `.genie`
   file in the folder you started Claude Code in.

To get a newer version later, run `/plugin marketplace update genocode`, then restart Claude Code.

## Install in Claude Desktop

You need [Claude Desktop](https://claude.com/download) for Windows or Mac. It comes with what the
extension needs, so you don't have to install Node.js.

1. Download `genocode.mcpb`, `genocode-creatures.zip` and `genocode-tutor.zip` from the
   [latest release](https://github.com/genocode-org/GenoCode-agent/releases/latest).
2. Open `genocode.mcpb` (double-click it, or drag it into Claude Desktop). Claude Desktop shows the
   GenoCode extension: click **Install**. It asks which folder to save creatures in. If you leave
   it, they go into a `GenoCode` folder in your Documents.
3. Add the skill, which teaches Claude the language and the rules for making creatures: in Claude
   Desktop's settings, find **Skills** (under Capabilities), choose to upload a skill, and pick
   `genocode-creatures.zip`. Leave the zip as it is; don't unzip it.
4. If you want Claude to teach you to write creatures yourself, upload `genocode-tutor.zip` the
   same way.
5. Start a new chat and ask for a creature, or ask to learn GenoCode.

To get a newer version later, download the files from the latest release again and install them
the same way.

## Open your creature

Go to the [GenoCode app](https://genocode.piorek.co.za/app/), choose **File**, then **Open a
.genie file…**, and pick the creature. You can also drag the file onto the app. You can then watch
it move, change its genes, breed it and make it dance.

## Other ways

- **Any app that runs MCP servers:** run `npx -y @genocode/agent`. Saved creatures go into the
  folder it's started in, or the folder given with `--out <folder>`. Give the app the skill from
  `genocode-creatures.zip` too, if it takes skills, and `genocode-tutor.zip` for lessons.
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
`desktop/manifest.json` in a pull request. Once it's merged, push a tag such as `v0.2.0` on `main`.
The release workflow stages the package on npm, where it waits until you approve it on
npmjs.com, and makes a GitHub release with `genocode.mcpb`, `genocode-creatures.zip` and
`genocode-tutor.zip`. `node scripts/release-files.mjs` builds those files locally, after
`npm run build`.

The skill's `docs/` are copies of [GenoCode's docs](https://github.com/genocode-org/GenoCode/tree/main/docs).
`npm run skill-docs` copies them again after GenoCode's docs change. A workflow checks every Monday
that they're the same, and fails if they aren't.

## License

Released under the [MIT License](LICENSE). See [CREDITS.md](CREDITS.md).
