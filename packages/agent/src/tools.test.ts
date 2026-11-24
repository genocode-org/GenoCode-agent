import { check } from "@genocode/core";
import { describe, expect, it } from "vitest";
import {
  checkCreature,
  checkFamily,
  describeGenes,
  finishCreature,
  listGenes,
  MAX_RENDER_TIMES,
  renderCreature,
  renderPng,
} from "./tools.js";

const GOOD = "creature T\ngene n = 2 in 1..4 step 1 // how many\nrepeat n {\n  lay\n}\n";
// Two balls that move apart as time goes by.
const LIVE = "creature L\nlay\nmove (1 + 3 * time, 0, 0)\nlay\n";
// A ball whose colour is a gene, with a variant that makes it orange.
const FAMILY =
  "creature F\ngene skin = hsv(0, 1, 1) in hsv(0, 0.5, 0.5)..hsv(40, 1, 1) // its colour\ncolour skin\nlay\n\nvariant Orange {\n  skin = hsv(30, 1, 1)\n}\n";
// The variant has more balls, so they pop in while it morphs.
const POPPING =
  "creature P\ngene n = 1 in 1..4 step 1 // how many\nrepeat n {\n  lay\n  forward 1\n}\n\nvariant Many {\n  n = 4\n}\n";
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

describe("check_creature", () => {
  it("says when there's nothing wrong", () => {
    expect(checkCreature(GOOD)).toBe("No problems.");
    expect(checkCreature("creature T\nforward  1\nlay\n")).toContain("standard layout");
  });

  it("lists errors and warnings with their place", () => {
    expect(checkCreature("creature B\nforward red\n")).toBe(
      "1 error:\ncreature:2:9: error: `forward` needs a number, not a colour.",
    );
    expect(checkCreature("creature W\nlay\nshape cone\n")).toMatch(
      /^Warnings only:\ncreature:3:1: warning: This `shape` is never used/,
    );
  });
});

describe("render_creature", () => {
  it("draws a picture for each time, with a caption", () => {
    const out = renderCreature(LIVE, [0, 1], 32);
    expect(out.map((o) => o.kind)).toEqual(["text", "png", "text", "png"]);
    expect(out[0]).toEqual({ kind: "text", text: "time = 0: 2 shapes" });
    const [a, b] = [out[1], out[3]].map((o) => (o?.kind === "png" ? o.data : undefined));
    expect(Array.from(a!.slice(0, 8))).toEqual(PNG_SIGNATURE);
    expect(a).not.toEqual(b);
  });

  it("draws the rest pose when no time is given, and at most a few times", () => {
    expect(renderCreature(GOOD, [], 32).filter((o) => o.kind === "png")).toHaveLength(1);
    const many = renderCreature(LIVE, [0, 1, 2, 3, 4, 5], 32);
    expect(many.filter((o) => o.kind === "png")).toHaveLength(MAX_RENDER_TIMES);
  });

  it("says when a creature doesn't move", () => {
    const out = renderCreature(GOOD, [0, 1], 32);
    expect(out.at(-1)).toEqual({
      kind: "text",
      text: expect.stringContaining("doesn't read time"),
    });
  });

  it("explains why a creature with errors can't be drawn", () => {
    expect(renderCreature("creature B\nforward red\n", [0])).toEqual([
      { kind: "text", text: expect.stringContaining("can't be drawn") },
    ]);
  });
});

describe("render_creature, with a variant or several views", () => {
  const png = (out: ReturnType<typeof renderCreature>) =>
    out.flatMap((o) => (o.kind === "png" ? [o.data] : []));
  const width = (data: Uint8Array) => new DataView(data.buffer, data.byteOffset).getUint32(16);

  it("draws a variant instead of the creature's own genes", () => {
    const own = renderCreature(FAMILY, [0], 32);
    const big = renderCreature(FAMILY, [0], 32, { variant: "Orange" });
    expect(big[0]).toEqual({ kind: "text", text: "Orange, time = 0: 1 shape" });
    expect(png(big)[0]).not.toEqual(png(own)[0]);
  });

  it("draws several views side by side", () => {
    const out = renderCreature(FAMILY, [0], 32, { views: ["front", "right"] });
    expect(out[0]).toEqual({ kind: "text", text: "time = 0: 1 shape, seen from front, right" });
    expect(width(png(out)[0]!)).toBeGreaterThan(64);
  });

  it("says when a variant or a view doesn't exist", () => {
    expect(renderCreature(FAMILY, [0], 32, { variant: "Huge" })).toEqual([
      { kind: "text", text: "There's no variant called Huge. Its variants are: Orange." },
    ]);
    expect(renderCreature(GOOD, [0], 32, { variant: "Huge" })[0]).toEqual({
      kind: "text",
      text: expect.stringContaining("has no variants"),
    });
    expect(renderCreature(FAMILY, [0], 32, { views: ["under"] })[0]).toEqual({
      kind: "text",
      text: expect.stringContaining("under isn't a view"),
    });
  });
});

describe("check_family", () => {
  it("passes a family that morphs smoothly", async () => {
    const report = await checkFamily(FAMILY);
    expect(report).toContain("1. check");
    expect(report).toContain("PASSED");
  });

  it("fails a family where parts pop in while it morphs", async () => {
    expect(await checkFamily(POPPING)).toMatch(/FAIL/);
  });
});

describe("renderPng", () => {
  it("builds the creature at the time asked for", () => {
    const program = check(LIVE);
    const { built } = renderPng(program, { size: 16, time: 2 });
    expect(built.shapes[1]!.matrix[12]).toBeCloseTo(7);
  });
});

describe("list_genes", () => {
  it("lists genes with their ranges and descriptions", () => {
    expect(listGenes(GOOD)).toBe("n = 2 in 1..4 step 1 // how many");
    expect(listGenes("creature T\nlay\n")).toBe("The creature has no genes.");
    expect(listGenes("creature B\nforward red\n")).toContain("1 error");
    expect(describeGenes(check(GOOD).genes)).toEqual(["n = 2 in 1..4 step 1 // how many"]);
  });
});

describe("save_creature", () => {
  it("formats a creature and keeps its warnings", () => {
    const result = finishCreature("creature W\nforward  1\nlay\nshape cone\n");
    expect(result).toEqual({
      finished: {
        name: "W",
        source: "creature W\nforward 1\nlay\nshape cone\n",
        warnings: [expect.stringContaining("never used")],
      },
    });
  });

  it("refuses creatures with errors, and other kinds of file", () => {
    expect(finishCreature("creature B\nforward red\n")).toEqual({
      problem: expect.stringContaining("Not saved. 1 error"),
    });
    expect(finishCreature("background Sky\nfill red\n")).toEqual({
      problem: expect.stringContaining("creature <Name>"),
    });
  });
});
