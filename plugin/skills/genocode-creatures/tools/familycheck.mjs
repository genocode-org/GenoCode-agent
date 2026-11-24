// Checks that a GenoCode creature morphs, breeds and dances seamlessly.
//
//   cd tools && npm install        (once: gets @genocode/core from npm)
//   node tools/familycheck.mjs MyCreature.genie [--steps=60] [--seed=1]
//
// It reports, for the creature and its variants (its family):
//   1. check    errors and warnings from the checker
//   2. morph    walks the morph loop (creature → each variant → back) and reports any change in the
//               number of shapes or stroke points (a part popping in or out), a shape changing kind,
//               single frames that move far more than the rest (a jump), and colours that jump
//   3. size     how big each family member is round the camera's focus point; the camera keeps
//               the first one's framing while dancing, so the family should be about the same size
//   4. breed    builds mutated and bred children and checks they build and stay a sensible size
//   5. dance    builds every member at moments of a song (time, beat and music values) and checks
//               the shape count holds steady, nothing goes non-finite and a build is fast enough
//
// Exit code 0 when nothing failed (warnings are allowed), 1 otherwise.

import { readFileSync } from "node:fs";
import * as core from "@genocode/core";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
};
if (!file) {
  console.error("usage: node familycheck.mjs <creature.genie> [--steps=60] [--seed=1]");
  process.exit(2);
}
const STEPS = opt("steps", 60);
const random = core.mulberry32(opt("seed", 1));

let failed = false;
const fail = (msg) => {
  failed = true;
  console.log(`  FAIL ${msg}`);
};
const warn = (msg) => console.log(`  warn ${msg}`);
const ok = (msg) => console.log(`  ok   ${msg}`);

// ---------- 1. check ----------

console.log("1. check");
const program = core.check(readFileSync(file, "utf8"));
for (const d of program.diagnostics) {
  const line = program.lines ? lineOf(d.span.start) : "?";
  (d.severity === "error" ? fail : warn)(`line ${line}: ${d.message}`);
}
if (!program.ok) {
  console.log("\nThe file has errors; fix them first.");
  process.exit(1);
}
if (program.file.kind !== "creature") {
  console.log("\nThis file isn't a creature.");
  process.exit(1);
}
const names = ["(creature)", ...program.variants.map((v) => v.name)];
const family = [
  core.valuesOf(program.genes),
  ...program.variants.map((v) => core.valuesOf(program.genes, v.values)),
];
ok(`${program.genes.length} genes, ${program.variants.length} variants`);
if (program.variants.length < 3) warn("fewer than 3 variants: the morph loop and dance will be short");
if (program.dance === undefined) warn("no dance block: the app's selected dance style is used");

function lineOf(offset) {
  const text = program.text;
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) if (text[i] === "\n") line++;
  return line;
}

// ---------- helpers ----------

const REST = { time: 0, beat: 0, music: {} };

function build(values, inputs = REST) {
  const t0 = performance.now();
  const r = core.build(program, { genes: values, inputs });
  return { ...r, ms: performance.now() - t0 };
}

/** Every placement in a build: one per shape, and one per stroke point. */
function placements(shapes) {
  const out = [];
  for (const s of shapes) {
    const ms = s.points ? s.points.map((p) => p.matrix) : [s.matrix];
    for (const m of ms) out.push({ kind: s.shape, m, colour: s.colour });
  }
  return out;
}

const pos = (m) => [m[12], m[13], m[14]];
const scale = (m) =>
  Math.max(Math.hypot(m[0], m[1], m[2]), Math.hypot(m[4], m[5], m[6]), Math.hypot(m[8], m[9], m[10]));

/** How far the creature reaches from its focus point (or the middle of its shapes). */
function radius(result) {
  const ps = placements(result.shapes);
  if (ps.length === 0) return 0;
  let c = result.focus;
  if (!c) {
    c = [0, 0, 0];
    for (const p of ps) for (let i = 0; i < 3; i++) c[i] += pos(p.m)[i] / ps.length;
  }
  let r = 0;
  for (const p of ps) {
    const [x, y, z] = pos(p.m);
    r = Math.max(r, Math.hypot(x - c[0], y - c[1], z - c[2]) + scale(p.m) / 2);
  }
  return r;
}

const nonFinite = (result) =>
  result.diagnostics.filter((d) => /finite|not a number/i.test(d.message)).length;

// ---------- 2. morph ----------

console.log("\n2. morph loop");
if (family.length < 2) {
  warn("no variants, so there is no morph loop to check");
} else {
  const frames = [];
  for (let i = 0; i < family.length; i++) {
    const a = { genes: program.genes, values: family[i] };
    const b = { genes: program.genes, values: family[(i + 1) % family.length] };
    for (let s = 0; s < STEPS; s++) {
      const { values } = core.morph(a, b, s / STEPS);
      frames.push({ from: i, t: s / STEPS, ps: placements(build(values).shapes) });
    }
  }
  const where = (f) =>
    `${names[f.from]} → ${names[(f.from + 1) % family.length]} at ${f.t.toFixed(2)}`;
  // How much of each kind of shape a frame shows: the sum of its shapes' sizes. A part that comes
  // or goes while tiny hardly changes it; one that pops in or out at a visible size does.
  const mass = (ps) => {
    const out = new Map();
    for (const p of ps) out.set(p.kind, (out.get(p.kind) ?? 0) + (scale(p.m) || 0));
    return out;
  };
  const massChange = (a, b) => {
    const ma = mass(a.ps);
    const mb = mass(b.ps);
    let d = 0;
    for (const k of new Set([...ma.keys(), ...mb.keys()])) d += Math.abs((ma.get(k) ?? 0) - (mb.get(k) ?? 0));
    return d;
  };
  const total = (f) => [...mass(f.ps).values()].reduce((x, y) => x + y, 0);
  const steady = [];
  for (let k = 0; k < frames.length; k++) {
    const a = frames[k];
    const b = frames[(k + 1) % frames.length];
    if (a.ps.length === b.ps.length) steady.push(massChange(a, b));
  }
  steady.sort((x, y) => x - y);
  const usualChange = steady.length ? steady[steady.length >> 1] : 0;

  const moves = [];
  let countChanges = 0;
  let pops = 0;
  for (let k = 0; k < frames.length; k++) {
    const a = frames[k];
    const b = frames[(k + 1) % frames.length];
    const sameKinds = a.ps.length === b.ps.length && a.ps.every((p, i) => p.kind === b.ps[i].kind);
    if (!sameKinds) {
      if (a.ps.length !== b.ps.length) countChanges++;
      const d = massChange(a, b);
      if (d > 10 * usualChange && d > 0.01 * total(a)) {
        if (pops++ < 5)
          fail(
            a.ps.length === b.ps.length
              ? `shapes change kind at a visible size, ${where(b)}`
              : `${a.ps.length} → ${b.ps.length} shapes and stroke points, and the change is visible, ${where(b)}`,
          );
      }
      continue;
    }
    let most = 0;
    // A shape too small to see can move as far as it likes: it doesn't count.
    const tiny = 1e-3 * Math.max(0, ...a.ps.map((q) => scale(q.m) || 0));
    for (let i = 0; i < a.ps.length; i++) {
      if (Math.max(scale(a.ps[i].m), scale(b.ps[i].m)) < tiny) continue;
      const pa = pos(a.ps[i].m);
      const pb = pos(b.ps[i].m);
      const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
      const ds = Math.abs(scale(a.ps[i].m) - scale(b.ps[i].m));
      if (Number.isFinite(d + ds)) most = Math.max(most, d + ds);
    }
    moves.push({ most, frame: b });
  }
  if (pops > 5) fail(`… ${pops} visible pops in all`);
  if (countChanges === 0) ok("the number of shapes and stroke points never changes");
  else if (pops === 0)
    ok(`the shape count changes ${countChanges} times, but only while the shapes are tiny`);
  if (moves.length > 0) {
    const sorted = moves.map((m) => m.most).sort((x, y) => x - y);
    const median = sorted[sorted.length >> 1] || 1e-9;
    const jumps = moves.filter((m) => m.most > 10 * median && m.most > 0.05);
    for (const j of jumps.slice(0, 5))
      fail(`a jump ${(j.most / median).toFixed(0)}× the usual move, ${where(j.frame)}`);
    if (jumps.length === 0)
      ok(`smooth: the worst frame moves ${(sorted.at(-1) / median).toFixed(1)}× the usual`);
  }
  const colourJumps = core.colourJumps(program);
  for (const j of colourJumps.slice(0, 5))
    fail(`a colour leaps ${j.degrees.toFixed(0)}°, ${names[j.from]} → ${names[j.to]} at ${j.t.toFixed(2)}`);
  if (colourJumps.length === 0) ok("no colour jumps");
}

// ---------- 3. size ----------

console.log("\n3. size");
const sizes = family.map((v) => radius(build(v)));
sizes.forEach((r, i) => console.log(`       ${names[i]}: ${r.toFixed(2)}`));
const ratio = Math.max(...sizes) / Math.max(1e-9, Math.min(...sizes));
if (Math.min(...sizes) === 0) fail("a family member lays nothing at rest");
else if (ratio > 5) fail(`the biggest is ${ratio.toFixed(1)}× the smallest: the dance camera won't fit both`);
else if (ratio > 2) warn(`the biggest is ${ratio.toFixed(1)}× the smallest: the dance camera keeps the first one's framing`);
else ok(`sizes within ${ratio.toFixed(1)}× of each other`);

// ---------- 4. breed ----------

console.log("\n4. breed and mutate");
if (!program.breedable) {
  warn("the creature says `breed off`: it can't be mutated or bred");
} else {
  const spread = core.familySpread(program.genes, family);
  const pick = () => family[Math.floor(random() * family.length)];
  const children = [];
  for (let i = 0; i < 20; i++) {
    children.push(["mutated", core.mutate(program.genes, pick(), { random, strength: 0.5, spread })]);
    children.push(["mutated hard", core.mutate(program.genes, pick(), { random, strength: 1 })]);
    const a = { genes: program.genes, values: pick() };
    const b = { genes: program.genes, values: pick() };
    children.push(["bred", core.breed(a, b, { random })]);
  }
  const big = Math.max(...sizes);
  const small = Math.min(...sizes);
  let bad = 0;
  for (const [how, values] of children) {
    const r = build(values);
    const size = radius(r);
    const problem = !r.ok
      ? "doesn't build"
      : r.shapes.length === 0
        ? "lays nothing"
        : nonFinite(r) > 0
          ? "has shapes that aren't finite"
          : size > big * 4 || size < small / 4
            ? `is ${size.toFixed(2)} across, far from the family's ${small.toFixed(2)}–${big.toFixed(2)}`
            : null;
    if (problem && bad++ < 5) warn(`a ${how} child ${problem}`);
  }
  if (bad === 0) ok(`${children.length} children all build, at a sensible size`);
  else if (bad > children.length / 4) fail(`${bad} of ${children.length} children went wrong`);
}

// ---------- 5. dance ----------

console.log("\n5. dance");
const moments = [];
for (let i = 0; i < 24; i++) {
  const level = random();
  moments.push({
    time: i * 0.37,
    beat: random(),
    music: {
      bass: random(),
      mid: random(),
      high: random(),
      level,
      hit: random() < 0.3 ? 1 : 0,
      bass_hit: random() < 0.3 ? 1 : 0,
      mid_hit: random() < 0.3 ? 1 : 0,
      high_hit: random() < 0.3 ? 1 : 0,
    },
  });
}
const times = [];
const live = program.live;
family.forEach((values, i) => {
  const rest = build(values);
  const counts = new Set();
  let broken = 0;
  let growth = 1;
  for (const inputs of moments) {
    const r = build(values, inputs);
    times.push(r.ms);
    counts.add(placements(r.shapes).length);
    if (!r.ok || nonFinite(r) > 0) broken++;
    growth = Math.max(growth, radius(r) / Math.max(1e-9, radius(rest)));
  }
  if (counts.size > 1)
    warn(`${names[i]}: the number of shapes changes while it dances (${[...counts].join(", ")}): parts may pop`);
  if (broken > 0) fail(`${names[i]}: ${broken} moments don't build cleanly`);
  if (growth > 2.5) warn(`${names[i]}: grows ${growth.toFixed(1)}× its rest size while dancing`);
});
if (!live) warn("it doesn't move with time or music: only the morph and the dance style move it");
else ok("it moves with time and music");
times.sort((a, b) => a - b);
const ms = times[times.length >> 1];
if (ms > 30) warn(`a build takes ${ms.toFixed(0)} ms: a live creature is rebuilt every frame, so it will stutter`);
else ok(`a build takes ${ms.toFixed(1)} ms`);
if (program.dance !== undefined) {
  const d = core.buildDance(program, { inputs: moments[3] });
  for (const x of d.diagnostics) (x.severity === "error" ? fail : warn)(`dance block: ${x.message}`);
  if (d.style) ok("the dance block builds");
}

console.log(failed ? "\nFAILED: fix the FAIL lines above." : "\nPASSED (look over any warnings).");
process.exit(failed ? 1 : 0);
