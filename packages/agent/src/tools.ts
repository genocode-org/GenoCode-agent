// The work behind the agent's tools, kept free of the Claude SDK so the command line can share it
// and tests can run it without the network: checking, rendering, listing genes, checking a family
// and saving.

import { execFile } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  build,
  buildBackground,
  check,
  formatDiagnostic,
  formatText,
  formatValue,
  valuesOf,
  type BuildResult,
  type CheckResult,
  type Diagnostic,
  type GeneInfo,
  type Value,
} from "@genocode/core";
import { rasterize, type View } from "@genocode/render";
import { encodePng } from "./png.js";

/** One line per diagnostic, `file:line:column: severity: message`. */
export function describeDiagnostics(
  program: CheckResult,
  diagnostics: readonly Diagnostic[],
  file = "creature",
): string[] {
  return diagnostics.map((d) => formatDiagnostic(d, program.lines, file));
}

/** One line per gene: its full name, value, range and description. */
export function describeGenes(genes: readonly GeneInfo[]): string[] {
  return genes.map((g) => {
    let range = "";
    if (g.options) range = ` from [${g.options.map(formatValue).join(", ")}]`;
    else if (g.min !== undefined && g.max !== undefined) {
      range = ` in ${formatValue(g.min)}..${formatValue(g.max)}`;
      if (g.hue) range += g.hue.whole ? ", any hue" : `, hue ${g.hue.start}+${g.hue.length}°`;
      if (g.step !== undefined) range += ` step ${g.step}`;
      if (g.log) range += " log";
    }
    return `${g.fullName} = ${formatValue(g.value)}${range}${g.description ? ` // ${g.description}` : ""}`;
  });
}

export interface RenderOptions {
  /** Width and height of the picture in pixels. */
  size?: number;
  /** The value of `time`, in seconds. 0 is the rest pose. */
  time?: number;
  /** Gene values to build with, such as a variant's. Genes left out keep their written values. */
  genes?: ReadonlyMap<string, Value>;
  /** Where the creature is seen from, each drawn side by side; the front if left out. */
  views?: readonly View[];
}

/** The views render_creature can draw, in degrees of yaw and pitch. */
export const VIEWS: Record<string, View> = {
  front: { yaw: 0, pitch: 0 },
  right: { yaw: 90, pitch: 0 },
  back: { yaw: 180, pitch: 0 },
  left: { yaw: -90, pitch: 0 },
  top: { yaw: 0, pitch: 90 },
  bottom: { yaw: 0, pitch: -90 },
  "three-quarter": { yaw: 45, pitch: 30 },
};

/** Builds a checked creature at a moment in time and draws it as a PNG. */
export function renderPng(
  program: CheckResult,
  options: RenderOptions = {},
): { png: Uint8Array; built: BuildResult } {
  const size = options.size ?? 512;
  const inputs = { time: options.time ?? 0 };
  const genes = options.genes ?? new Map<string, Value>();
  const built = build(program, { inputs, genes });
  const background = buildBackground(program, { inputs, genes }).fill;
  const views = options.views ?? [undefined];
  const images = views.map((view) =>
    rasterize(built.shapes, { width: size, height: size, background, view, focus: built.focus }),
  );
  // Views side by side, with a see-through gap between them.
  const gap = Math.max(2, Math.round(size / 64));
  const width = size * images.length + gap * (images.length - 1);
  const data = new Uint8ClampedArray(width * size * 4);
  images.forEach((image, k) => {
    const left = k * (size + gap);
    for (let y = 0; y < size; y++) {
      data.set(image.data.subarray(y * size * 4, (y + 1) * size * 4), (y * width + left) * 4);
    }
  });
  return { png: encodePng(width, size, data), built };
}

/** Text, or a PNG picture, in the order a tool returns them. */
export type ToolOutput = { kind: "text"; text: string } | { kind: "png"; data: Uint8Array };

/** Checking: "No problems." or the errors and warnings, one per line. */
export function checkCreature(source: string): string {
  const program = check(source);
  if (program.diagnostics.length === 0) {
    const formatted = formatText(source).text;
    return formatted === source
      ? "No problems."
      : "No problems. (It isn't in the standard layout, but saving will fix that.)";
  }
  const errors = program.diagnostics.filter((d) => d.severity === "error").length;
  const summary = errors > 0 ? `${errors} error${errors === 1 ? "" : "s"}` : "Warnings only";
  return [`${summary}:`, ...describeDiagnostics(program, program.diagnostics)].join("\n");
}

export const MAX_RENDER_TIMES = 4;

/** At most this many views side by side in one picture. */
export const MAX_VIEWS = 5;

/** What to draw besides the creature's own genes from the front. */
export interface Look {
  /** A variant's name, to draw it instead of the creature's own genes. */
  variant?: string | undefined;
  /** Names from VIEWS, drawn side by side in each picture. */
  views?: readonly string[] | undefined;
}

/** Rendering at each time: a caption and a picture per time, or what stops it. */
export function renderCreature(
  source: string,
  times: readonly number[],
  size = 384,
  look: Look = {},
): ToolOutput[] {
  const program = check(source);
  const say = (text: string): ToolOutput[] => [{ kind: "text", text }];
  if (!program.ok) {
    return say(
      [
        "It has errors, so it can't be drawn:",
        ...describeDiagnostics(program, program.diagnostics),
      ].join("\n"),
    );
  }
  let genes: ReadonlyMap<string, Value> | undefined;
  if (look.variant !== undefined) {
    const variant = program.variants.find((v) => v.name === look.variant);
    if (!variant) {
      const names = program.variants.map((v) => v.name);
      return say(
        names.length > 0
          ? `There's no variant called ${look.variant}. Its variants are: ${names.join(", ")}.`
          : `There's no variant called ${look.variant}: the creature has no variants.`,
      );
    }
    genes = valuesOf(program.genes, variant.values);
  }
  let views: View[] | undefined;
  if (look.views !== undefined && look.views.length > 0) {
    const unknown = look.views.filter((v) => !(v in VIEWS));
    if (unknown.length > 0) {
      return say(
        `${unknown.join(", ")} isn't a view. The views are: ${Object.keys(VIEWS).join(", ")}.`,
      );
    }
    views = look.views.slice(0, MAX_VIEWS).map((v) => VIEWS[v]!);
  }
  const out: ToolOutput[] = [];
  const wanted = times.length > 0 ? times.slice(0, MAX_RENDER_TIMES) : [0];
  for (const time of wanted) {
    const { png, built } = renderPng(program, {
      size,
      time,
      ...(genes && { genes }),
      ...(views && { views }),
    });
    const notes = describeDiagnostics(program, built.diagnostics);
    const who = look.variant === undefined ? "" : `${look.variant}, `;
    const seen = views ? `, seen from ${look.views!.slice(0, MAX_VIEWS).join(", ")}` : "";
    const caption = `${who}time = ${time}: ${built.shapes.length} shape${built.shapes.length === 1 ? "" : "s"}${seen}`;
    out.push({ kind: "text", text: [caption, ...notes, ...built.printed].join("\n") });
    out.push({ kind: "png", data: png });
  }
  if (!program.live && wanted.length > 1) {
    out.push({
      kind: "text",
      text: "The creature doesn't read time, beat or music, so it looks the same at every time.",
    });
  }
  return out;
}

/** The genes the user will be able to change, one per line. */
export function listGenes(source: string): string {
  const program = check(source);
  if (!program.ok) return checkCreature(source);
  const lines = describeGenes(program.genes);
  return lines.length > 0 ? lines.join("\n") : "The creature has no genes.";
}

/** A creature ready to save: checked, without errors, in the standard layout. */
export interface Finished {
  name: string;
  source: string;
  /** Warnings the creature still has. */
  warnings: string[];
}

/** Checks and formats a creature for saving, or explains why it can't be saved. */
export function finishCreature(source: string): { finished: Finished } | { problem: string } {
  const program = check(source);
  if (!program.ok) {
    return { problem: `Not saved. ${checkCreature(source)}` };
  }
  if (program.file.kind !== "creature") {
    return { problem: "Not saved: the file must start with `creature <Name>`." };
  }
  const formatted = formatText(source).text ?? source;
  return {
    finished: {
      name: program.file.name,
      source: formatted,
      warnings: describeDiagnostics(program, program.diagnostics),
    },
  };
}

/** The skill's family check, found from src/ and from dist/ alike. */
const FAMILY_CHECK = fileURLToPath(
  new URL("../../../.claude/skills/genocode-creatures/tools/familycheck.mjs", import.meta.url),
);

/**
 * Runs the skill's family check on a creature: whether it and its variants morph into each other
 * smoothly, breed and dance well. Its report, which says what passed and what failed.
 */
export async function checkFamily(source: string): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), "genocode-family-"));
  try {
    const file = join(dir, "creature.genie");
    writeFileSync(file, source);
    try {
      const { stdout } = await promisify(execFile)(process.execPath, [FAMILY_CHECK, file]);
      return stdout.trim();
    } catch (error) {
      // It exits with 1 when something failed; the report is still on its output.
      const { stdout } = error as { stdout?: string };
      if (stdout) return stdout.trim();
      throw error;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
