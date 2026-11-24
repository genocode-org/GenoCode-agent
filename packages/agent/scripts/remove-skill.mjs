// Removes the copies prepack made, so development reads the skill from the plugin folder again.

import { rmSync } from "node:fs";

rmSync(new URL("../skill/", import.meta.url), { recursive: true, force: true });
rmSync(new URL("../LICENSE", import.meta.url), { force: true });
