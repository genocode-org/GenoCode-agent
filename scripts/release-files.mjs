// Builds the files attached to a GitHub release, in release/:
//   genocode.mcpb           the Claude Desktop extension: the MCP server with everything it needs
//   genocode-creatures.zip  the skill, to upload in Claude Desktop or claude.ai
//
//   npm run build && node scripts/release-files.mjs

import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = `${root}release/`;
const stage = `${out}desktop/`;
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: "inherit" });
const { version } = JSON.parse(readFileSync(`${root}packages/agent/package.json`, "utf8"));

rmSync(out, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });

// The extension: the packed package, installed with its dependencies, beside the manifest.
run("npm", ["pack", "-w", "@genocode/agent", "--pack-destination", out]);
writeFileSync(
  `${stage}package.json`,
  JSON.stringify({
    private: true,
    dependencies: { "@genocode/agent": `file:../genocode-agent-${version}.tgz` },
  }),
);
run("npm", ["install", "--omit=dev", "--no-audit", "--no-fund", "--install-links"], stage);
cpSync(`${root}desktop/manifest.json`, `${stage}manifest.json`);
cpSync(`${root}desktop/icon.png`, `${stage}icon.png`);
run("npx", ["-y", "@anthropic-ai/mcpb@2.1.2", "pack", stage, `${out}genocode.mcpb`]);

// The skill, as a zip holding its folder.
run(
  "zip",
  ["-qr", `${out}genocode-creatures.zip`, "genocode-creatures", "-x", "*/node_modules/*"],
  `${root}plugin/skills/`,
);

rmSync(stage, { recursive: true, force: true });
console.log(`\nBuilt ${out}genocode.mcpb and ${out}genocode-creatures.zip`);
