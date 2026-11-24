# @genocode/agent

Design [GenoCode](https://github.com/genocode-org/GenoCode) creatures with Claude. Describe a
creature, and Claude writes it as a `.genie` file, checks it, draws it, fixes what's wrong and saves
it.

The package has three parts:

- **An MCP server** with tools to check, draw, list the genes of, family-check and save a creature.
  Claude Code and Claude Desktop use it, so your Claude plan covers the work and no API key is
  needed.
- **The `genocode-creatures` skill**, in `skill/`: the rules for making creatures, the language docs
  and sample creatures.
- **An agent for the Claude API**, `designCreature`, for programs that design creatures themselves.
  It needs an API key.

## Claude Code

Install the GenoCode plugin, which brings the skill and the server together:

```
/plugin marketplace add genocode-org/GenoCode-agent
/plugin install genocode@genocode
```

Then ask Claude to design a creature, for example "design a red ball with two wobbling antennae".
It saves the creature in the folder you're working in.

## Claude Desktop

Download `genocode.mcpb` from the
[latest release](https://github.com/genocode-org/GenoCode-agent/releases/latest) and open it to
install the server. Then add the skill: download `genocode-creatures.zip` from the same release and
upload it in Claude Desktop's settings, under skills.

## Any other MCP app

Run the server with `npx -y @genocode/agent`. Saved creatures go into the folder it's started in, or
the folder given with `--out <folder>`. Add the skill from the package's `skill/` folder if the app
supports skills.

## License

Released under the [MIT License](LICENSE).
