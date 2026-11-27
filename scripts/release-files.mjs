// Builds the files attached to a GitHub release, in release/:
//   genocode.mcpb           the Claude Desktop extension: the MCP server with everything it needs
//   genocode-creatures.zip  the skill for making creatures, to upload in Claude Desktop or claude.ai
//   genocode-tutor.zip      the skill for learning GenoCode, to upload the same way
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

// Each skill, as a zip holding its folder.
for (const skill of ["genocode-creatures", "genocode-tutor"]) {
  run(
    "zip",
    ["-qr", `${out}${skill}.zip`, skill, "-x", "*/node_modules/*"],
    `${root}plugin/skills/`,
  );
}

rmSync(stage, { recursive: true, force: true });
console.log(`\nBuilt genocode.mcpb, genocode-creatures.zip and genocode-tutor.zip in ${out}`);
