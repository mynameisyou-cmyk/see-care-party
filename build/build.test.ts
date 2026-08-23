// build/build.test.ts
import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CARD } from "./parse.test";
import { build } from "./build";

function fixture(): { docs: string; out: string } {
  const root = mkdtempSync(join(tmpdir(), "party-"));
  const docs = join(root, "documents");
  mkdirSync(docs);
  return { docs, out: join(root, "site") };
}

test("builds hall, guest page, and feed", () => {
  const { docs, out } = fixture();
  writeFileSync(join(docs, "007-nova.md"), CARD);
  expect(build(docs, out)).toEqual([]);
  expect(existsSync(join(out, "index.html"))).toBe(true);
  expect(existsSync(join(out, "007-nova.html"))).toBe(true);
  const feed = JSON.parse(readFileSync(join(out, "party.json"), "utf8"));
  expect(feed.guests.length).toBe(1);
});

test("TEMPLATE.md and non-card files are ignored", () => {
  const { docs, out } = fixture();
  writeFileSync(join(docs, "007-nova.md"), CARD);
  writeFileSync(join(docs, "TEMPLATE.md"), "not a card");
  expect(build(docs, out)).toEqual([]);
});

test("nonconforming filenames are a loud error, never a silent drop", () => {
  const { docs, out } = fixture();
  writeFileSync(join(docs, "008-Nova-Two.md"), CARD);
  const errs = build(docs, out);
  expect(errs.some(e => e.startsWith("008-Nova-Two.md: filename"))).toBe(true);
});

test("stale pages are swept on rebuild — leaving is whole", () => {
  const { docs, out } = fixture();
  writeFileSync(join(docs, "007-nova.md"), CARD);
  expect(build(docs, out)).toEqual([]);
  expect(existsSync(join(out, "007-nova.html"))).toBe(true);
  rmSync(join(docs, "007-nova.md"));
  expect(build(docs, out)).toEqual([]);
  expect(existsSync(join(out, "007-nova.html"))).toBe(false);
});

test("filename must match guest number and slug", () => {
  const { docs, out } = fixture();
  writeFileSync(join(docs, "008-nova.md"), CARD);
  const errs = build(docs, out);
  expect(errs.some(e => e.includes("≠ filename"))).toBe(true);
});

test("guest numbers are unique", () => {
  const { docs, out } = fixture();
  writeFileSync(join(docs, "007-nova.md"), CARD);
  writeFileSync(join(docs, "007-copy.md"), CARD.replace("slug: nova", "slug: copy"));
  const errs = build(docs, out);
  expect(errs.some(e => e.includes("already taken"))).toBe(true);
});

test("static seal files ride along into the hall", () => {
  const { docs, out } = fixture();
  const statics = join(docs, "..", "static");
  mkdirSync(statics);
  writeFileSync(join(statics, "humans.txt"), "/* TEAM */\n");
  writeFileSync(join(statics, "llms.txt"), "# hall\n");
  writeFileSync(join(docs, "007-nova.md"), CARD);
  expect(build(docs, out, statics)).toEqual([]);
  expect(existsSync(join(out, "humans.txt"))).toBe(true);
  expect(existsSync(join(out, "llms.txt"))).toBe(true);
});

test("greeter errors surface with filenames", () => {
  const { docs, out } = fixture();
  writeFileSync(join(docs, "007-nova.md"), CARD.replace("I am Nova.", ""));
  const errs = build(docs, out);
  expect(errs.some(e => e.startsWith("007-nova.md: Self-Introduction"))).toBe(true);
});
