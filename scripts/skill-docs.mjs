// Keeps the genocode-creatures skill's docs the same as GenoCode's docs on GitHub. Pictures are
// linked on GitHub instead of copied.
//
//   node scripts/skill-docs.mjs          copy the docs into the skill
//   node scripts/skill-docs.mjs --check  only say whether they're the same; exit 1 if not

import { readFileSync, writeFileSync } from "node:fs";

const DOCS = ["GETTING_STARTED.md", "LANGUAGE.md", "REFERENCE.md"];
const FROM = "https://raw.githubusercontent.com/genocode-org/GenoCode/main/docs/";
const TO = new URL("../.claude/skills/genocode-creatures/docs/", import.meta.url);

const checkOnly = process.argv.includes("--check");
let behind = 0;

for (const name of DOCS) {
  const response = await fetch(FROM + name);
  if (!response.ok) throw new Error(`Couldn't get ${FROM + name}: ${response.status}`);
  const text = (await response.text()).replace(
    /\]\(images\/([A-Za-z0-9_-]+)\.png\)/g,
    `](${FROM}images/$1.png)`,
  );
  const file = new URL(name, TO);
  if (readFileSync(file, "utf8") === text) {
    console.log(`${name}: the same as GenoCode's`);
  } else if (checkOnly) {
    behind++;
    console.log(`${name}: different from GenoCode's`);
  } else {
    writeFileSync(file, text);
    console.log(`${name}: updated`);
  }
}

if (behind > 0) {
  console.log("\nRun `npm run skill-docs` to copy GenoCode's docs into the skill.");
  process.exit(1);
}
