---
name: design-creature
description: Design a GenoCode creature (.genie file) from a description, using the genocode MCP tools to check, draw and save it. Use when asked to make or design a creature.
---

# Designing a creature

1. Call the `design_guide` tool of the `genocode` server and follow it. It explains how to work, and
   holds the GenoCode language definition and the starter creatures.
2. Write the creature, then use `check_creature`, `render_creature` and `list_genes` until it
   matches what the user asked for. Look at every picture `render_creature` returns.
3. Save it with `save_creature`. It goes into the folder the server was started in, as
   `<Name>.genie`. Tell the user where it is, what the creature is, how it moves and which genes are
   worth changing.
