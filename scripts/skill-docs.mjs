// Keeps the skills' docs the same as GenoCode's docs on GitHub, and the genocode-tutor skill's
// examples the same as the genocode-creatures skill's. Each skill carries its own copy, so it also
// works when it's uploaded on its own. Pictures are linked on GitHub instead of copied.
//
//   node scripts/skill-docs.mjs          copy the docs and examples into the skills
//   node scripts/skill-docs.mjs --check  only say whether they're the same; exit 1 if not

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const DOCS = ["GETTING_STARTED.md", "LANGUAGE.md", "REFERENCE.md"];
const FROM = "https://raw.githubusercontent.com/genocode-org/GenoCode/main/docs/";
const SKILLS = new URL("../plugin/skills/", import.meta.url);
const SKILL_NAMES = ["genocode-creatures", "genocode-tutor"];
const EXAMPLES_FROM = new URL("genocode-creatures/examples/", SKILLS);
const EXAMPLES_TO = new URL("genocode-tutor/examples/", SKILLS);

const checkOnly = process.argv.includes("--check");
let behind = 0;

// Writes text to a file if it differs, or only counts the difference with --check.
function keep(file, text, label) {
  if (existsSync(file) && readFileSync(file, "utf8") === text) {
    console.log(`${label}: the same`);
  } else if (checkOnly) {
    behind++;
    console.log(`${label}: different`);
  } else {
    writeFileSync(file, text);
    console.log(`${label}: updated`);
  }
}

for (const name of DOCS) {
  const response = await fetch(FROM + name);
  if (!response.ok) throw new Error(`Couldn't get ${FROM + name}: ${response.status}`);
  const text = (await response.text()).replace(
    /\]\(images\/([A-Za-z0-9_-]+)\.png\)/g,
    `](${FROM}images/$1.png)`,
  );
  for (const skill of SKILL_NAMES) {
    const dir = new URL(`${skill}/docs/`, SKILLS);
    if (!checkOnly) mkdirSync(dir, { recursive: true });
    keep(new URL(name, dir), text, `${skill}/docs/${name}`);
  }
}

if (!checkOnly) mkdirSync(EXAMPLES_TO, { recursive: true });
for (const name of readdirSync(EXAMPLES_FROM)) {
  const text = readFileSync(new URL(name, EXAMPLES_FROM), "utf8");
  keep(new URL(name, EXAMPLES_TO), text, `genocode-tutor/examples/${name}`);
}

if (behind > 0) {
  console.log("\nRun `npm run skill-docs` to copy the docs and examples into the skills.");
  process.exit(1);
}
