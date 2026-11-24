// Where the genocode-creatures skill is: copied into the package when it's published, or in the
// repository's plugin folder while developing. Found from src/ and from dist/ alike.

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PACKAGED = new URL("../skill/", import.meta.url);
const IN_REPOSITORY = new URL("../../../plugin/skills/genocode-creatures/", import.meta.url);

/** The skill folder, as a URL ending in `/`. */
export const SKILL = existsSync(fileURLToPath(new URL("SKILL.md", PACKAGED)))
  ? PACKAGED
  : IN_REPOSITORY;
