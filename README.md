<p align="center"><img src="https://raw.githubusercontent.com/genocode-org/GenoCode/main/branding/logo-lockup.svg" alt="GenoCode" width="480"></p>

# GenoCode-agent

An AI agent that designs [GenoCode](https://github.com/genocode-org/GenoCode) creatures from a
description, with Claude.

**Status: on hold.** The agent works, but it isn't being developed or published for now. When it is
picked up again, it will be published as `@genocode/agent` and `genie create` will return to
[GenoCode-cli](https://github.com/genocode-org/GenoCode-cli).

## How it works

Given a description, the agent writes a `.genie` creature, checks it, draws it at a few moments to
see how it looks and moves, fixes what's wrong and saves it. Its system prompt is the GenoCode
language definition and the starter creatures, which it reads from
[`@genocode/core`](https://www.npmjs.com/package/@genocode/core), so it always teaches the
version of the language that it checks against. It uses Claude Opus 5.5 by default.

## Development

You need Node.js 22 or later (see `.nvmrc`) and Claude API credentials: set `ANTHROPIC_API_KEY`,
or run `ant auth login` once. The tests don't call the API.

```
npm install
npm run check     # build, type-check, test and check formatting, as CI does
```

## License

Released under the [MIT License](LICENSE). See [CREDITS.md](CREDITS.md).
