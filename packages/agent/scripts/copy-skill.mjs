// Copies the genocode-creatures skill, and the license, into the package before it's packed, so
// the published package carries them. Run by `npm pack` and `npm publish` (prepack).

import { cpSync, rmSync } from "node:fs";

const skill = new URL("../../../plugin/skills/genocode-creatures/", import.meta.url);
const into = new URL("../skill/", import.meta.url);

rmSync(into, { recursive: true, force: true });
cpSync(skill, into, {
  recursive: true,
  filter: (path) => !/[/\\](node_modules|package-lock\.json)$/.test(path),
});
cpSync(new URL("../../../LICENSE", import.meta.url), new URL("../LICENSE", import.meta.url));
console.log("Copied the genocode-creatures skill and the license into the package.");
