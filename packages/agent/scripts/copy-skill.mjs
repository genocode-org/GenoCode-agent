// Copies the genocode-creatures skill (into skill/), the genocode-tutor skill (into tutor/) and the
// license into the package before it's packed, so the published package carries them. Run by
// `npm pack` and `npm publish` (prepack).

import { cpSync, rmSync } from "node:fs";

const skills = new URL("../../../plugin/skills/", import.meta.url);

for (const [name, folder] of [
  ["genocode-creatures", "skill"],
  ["genocode-tutor", "tutor"],
]) {
  const into = new URL(`../${folder}/`, import.meta.url);
  rmSync(into, { recursive: true, force: true });
  cpSync(new URL(`${name}/`, skills), into, {
    recursive: true,
    filter: (path) => !/[/\\](node_modules|package-lock\.json)$/.test(path),
  });
}
cpSync(new URL("../../../LICENSE", import.meta.url), new URL("../LICENSE", import.meta.url));
console.log(
  "Copied the genocode-creatures and genocode-tutor skills and the license into the package.",
);
