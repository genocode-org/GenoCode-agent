import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer } from "./mcp.js";

const LIVE = "creature L\nlay\nmove (1 + 3 * time, 0, 0)\nlay\n";

let dir: string;
let client: Client;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "genocode-mcp-"));
  const [a, b] = InMemoryTransport.createLinkedPair();
  await createServer({ saveDir: dir }).connect(a);
  client = new Client({ name: "test", version: "0" });
  await client.connect(b);
});

afterEach(async () => {
  await client.close();
  rmSync(dir, { recursive: true, force: true });
});

const call = async (name: string, args: Record<string, unknown> = {}) =>
  (await client.callTool({ name, arguments: args })).content as {
    type: string;
    text?: string;
    mimeType?: string;
  }[];

describe("MCP server", () => {
  it("offers the four tools", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual([
      "check_creature",
      "render_creature",
      "list_genes",
      "check_family",
      "save_creature",
    ]);
  });

  it("checks, draws and lists genes", async () => {
    expect(await call("check_creature", { source: "creature B\nforward red\n" })).toEqual([
      { type: "text", text: expect.stringContaining("1 error") },
    ]);
    const pictures = await call("render_creature", { source: LIVE, times: [0, 1] });
    expect(pictures.map((c) => c.type)).toEqual(["text", "image", "text", "image"]);
    expect(pictures[1]!.mimeType).toBe("image/png");
    expect(await call("render_creature", { source: LIVE })).toHaveLength(2);
    expect(await call("list_genes", { source: LIVE })).toEqual([
      { type: "text", text: "The creature has no genes." },
    ]);
  });

  it("saves a creature to the folder, and refuses one with errors", async () => {
    const [saved] = await call("save_creature", { source: "creature Blob\nlay\n\n" });
    expect(saved!.text).toBe(`Saved Blob to ${join(dir, "Blob.genie")}.`);
    expect(readFileSync(join(dir, "Blob.genie"), "utf8")).toBe("creature Blob\nlay\n");
    const [refused] = await call("save_creature", { source: "creature B\nforward red\n" });
    expect(refused!.text).toContain("Not saved");
  });

  it("has a prompt that asks for a creature with the skill", async () => {
    const { messages } = await client.getPrompt({
      name: "design_creature",
      arguments: { description: "a blob" },
    });
    const content = messages[0]!.content as { text: string };
    expect(content.text).toContain("genocode-creatures skill");
    expect(content.text).toMatch(/Design this creature: a blob$/);
  });
});
