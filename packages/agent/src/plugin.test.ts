import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const json = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

describe("the Claude Code plugin and the Claude Desktop extension", () => {
  it("the plugin has the package's version, and starts that version of the server", () => {
    const { version } = json("../package.json");
    const plugin = json("../../../plugin/.claude-plugin/plugin.json");
    expect(plugin.version).toBe(version);
    expect(plugin.mcpServers.genocode).toEqual({
      command: "npx",
      args: ["-y", `@genocode/agent@${version}`],
    });
  });

  it("the Claude Desktop extension has the package's version", () => {
    const { version } = json("../package.json");
    expect(json("../../../desktop/manifest.json").version).toBe(version);
  });
});
