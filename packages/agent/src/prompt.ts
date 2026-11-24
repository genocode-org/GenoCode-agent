// The agent's system prompt: how to use its tools in place of the shell commands the skill names,
// then the whole genocode-creatures skill (its rules, the language docs and the sample creatures).
// It's the same for every request, so it can be cached.

import { readdirSync, readFileSync } from "node:fs";

/** The skill folder, found from src/ and from dist/ alike. */
const SKILL = new URL("../../../.claude/skills/genocode-creatures/", import.meta.url);

const INSTRUCTIONS = `You design GenoCode creatures for the user. Follow the genocode-creatures skill below. All its \
files are included, so you don't need to read them.

You have no shell. Use your tools instead:
- check_creature in place of \`genie check\`. Fix every error, and every warning unless it's intended.
- render_creature in place of \`genie render\`. It draws the creature at moments in time (time 0 is \
the rest pose); it can't draw variants or side views. Look at every picture and compare it with what \
the user asked for.
- list_genes shows the genes the user will be able to change.
- \`genie jumps\` and \`tools/familycheck.mjs\` aren't available, so follow "Making variants blend" \
carefully.
- To hand the creature over, call save_creature, then reply with a short summary of what it is.

If you need to ask the user something, such as how many variants they want, reply with the question \
and don't save anything.`;

/** The skill's files in reading order: the skill, the docs, the samples and the template. */
function skillFiles(): string[] {
  const list = (dir: string, ext: string) =>
    readdirSync(new URL(dir, SKILL))
      .filter((f) => f.endsWith(ext))
      .sort()
      .map((f) => `${dir}${f}`);
  return [
    "SKILL.md",
    "docs/GETTING_STARTED.md",
    "docs/LANGUAGE.md",
    "docs/REFERENCE.md",
    "examples/README.md",
    ...list("examples/", ".genie"),
    ...list("templates/", ".genie"),
  ];
}

/** The whole skill, one `<file>` per file. */
function reference(): string {
  const files = skillFiles().map(
    (path) => `<file path="${path}">\n${readFileSync(new URL(path, SKILL), "utf8")}</file>`,
  );
  return `<skill name="genocode-creatures">\n${files.join("\n\n")}\n</skill>`;
}

/** The system prompt's two parts: the instructions, and the skill. */
export function systemPrompt(): { instructions: string; reference: string } {
  return { instructions: INSTRUCTIONS, reference: reference() };
}
