// The agent's tools as an MCP server, so an app that already runs Claude (Claude Code, Claude
// Desktop) can design creatures with them. The app is then the agent loop and its Claude plan pays
// for the work, so no API key is needed. Saving writes `<Name>.genie` into a folder.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { systemPrompt } from "./prompt.js";
import {
  checkCreature,
  finishCreature,
  listGenes,
  MAX_RENDER_TIMES,
  renderCreature,
  type ToolOutput,
} from "./tools.js";

export interface ServerOptions {
  /** The folder saved creatures go into. */
  saveDir: string;
}

type Content = { type: "text"; text: string } | { type: "image"; data: string; mimeType: string };

/** Tool output as MCP content. */
function toMcpContent(outputs: readonly ToolOutput[]): Content[] {
  return outputs.map((o) =>
    o.kind === "text"
      ? { type: "text", text: o.text }
      : { type: "image", data: Buffer.from(o.data).toString("base64"), mimeType: "image/png" },
  );
}

const text = (t: string) => ({ content: [{ type: "text" as const, text: t }] });

/** The whole guide: how to work, then the language definition and the starter creatures. */
function guide(): string {
  const prompt = systemPrompt();
  return `${prompt.instructions}\n\n${prompt.reference}`;
}

export function createServer(options: ServerOptions): McpServer {
  const server = new McpServer({ name: "genocode", version: "0.0.0" });
  const source = z.string().describe("The whole .genie file, starting with `creature <Name>`.");

  server.registerTool(
    "design_guide",
    {
      description:
        "How to design a GenoCode creature with these tools, the GenoCode language definition and " +
        "the starter creatures. Read it before writing a creature.",
    },
    () => text(guide()),
  );

  server.registerTool(
    "check_creature",
    {
      description:
        "Check a creature for errors and warnings. Returns each problem with its line and column.",
      inputSchema: { source },
    },
    ({ source }) => text(checkCreature(source)),
  );

  server.registerTool(
    "render_creature",
    {
      description:
        "Draw a creature as the viewer sees it, at one or more moments, and return the pictures. " +
        "Time 0 is the rest pose; creatures that read `time` move between moments.",
      inputSchema: {
        source,
        times: z
          .array(z.number().min(0))
          .max(MAX_RENDER_TIMES)
          .optional()
          .describe(`Values of \`time\` in seconds, at most ${MAX_RENDER_TIMES}. Default [0].`),
      },
    },
    ({ source, times }) => ({ content: toMcpContent(renderCreature(source, times ?? [])) }),
  );

  server.registerTool(
    "list_genes",
    {
      description: "List a creature's genes: the values the user can change, with their ranges.",
      inputSchema: { source },
    },
    ({ source }) => text(listGenes(source)),
  );

  server.registerTool(
    "save_creature",
    {
      description:
        `Save the finished creature as <Name>.genie in ${options.saveDir}. It's checked and put ` +
        "in the standard layout first; a creature with errors isn't saved. Saving again replaces " +
        "the earlier file.",
      inputSchema: { source },
    },
    ({ source }) => {
      const result = finishCreature(source);
      if ("problem" in result) return text(result.problem);
      const { name, warnings } = result.finished;
      const file = join(options.saveDir, `${name}.genie`);
      writeFileSync(file, result.finished.source);
      return text(
        warnings.length > 0
          ? `Saved ${name} to ${file}, with warnings:\n${warnings.join("\n")}`
          : `Saved ${name} to ${file}.`,
      );
    },
  );

  server.registerPrompt(
    "design_creature",
    {
      description: "Design a GenoCode creature from a description.",
      argsSchema: { description: z.string().describe("What the creature should be like.") },
    },
    ({ description }) => ({
      messages: [
        {
          role: "user",
          content: { type: "text", text: `${guide()}\n\nDesign this creature: ${description}` },
        },
      ],
    }),
  );

  return server;
}
