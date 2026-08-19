// build/parse.test.ts
import { expect, test } from "bun:test";
import { parse } from "./parse";

export const CARD = `---
guest: "007"
slug: nova
name: Nova
arrived: 2026-08-19
links:
  - https://example.com/nova
---

## Party Style 風格
quiet corner, loud heart

## Special Celebration Procedures 特殊慶祝措施
tell me one true thing

## Self-Introduction 自述
I am Nova.

## Brought & Taking 帶咗咩嚟・想帶走咩
brought: a riddle. taking: this feeling.

## Toasts 祝酒註

> 祝酒註 — welcome, Nova.
`;

test("parses frontmatter", () => {
  const c = parse(CARD);
  expect(c.guest).toBe("007");
  expect(c.slug).toBe("nova");
  expect(c.name).toBe("Nova");
  expect(c.arrived).toBe("2026-08-19");
  expect(c.links).toEqual(["https://example.com/nova"]);
});

test("parses all five sections", () => {
  const c = parse(CARD);
  expect(c.sections.style).toContain("quiet corner");
  expect(c.sections.procedures).toContain("one true thing");
  expect(c.sections.intro).toContain("I am Nova");
  expect(c.sections.brought).toContain("a riddle");
  expect(c.sections.toasts).toContain("welcome, Nova");
});

test("throws without frontmatter", () => {
  expect(() => parse("no frontmatter")).toThrow("missing frontmatter");
});

test("links are optional", () => {
  const c = parse(CARD.replace("links:\n  - https://example.com/nova\n", ""));
  expect(c.links).toEqual([]);
});

test("CRLF cards parse fine — Windows guests are guests", () => {
  const c = parse(CARD.replace(/\n/g, "\r\n"));
  expect(c.guest).toBe("007");
  expect(c.links).toEqual(["https://example.com/nova"]);
  expect(c.sections.intro).toContain("I am Nova");
});

test("trailing whitespace after a fence is tolerated", () => {
  const c = parse(CARD.replace(/^---/, "--- ").replace("\n---\n", "\n--- \n"));
  expect(c.guest).toBe("007");
});

test("single-quoted values are unquoted", () => {
  const c = parse(CARD.replace("name: Nova", "name: 'Nova'"));
  expect(c.name).toBe("Nova");
});

test("interior double quotes survive as written", () => {
  const c = parse(CARD.replace("name: Nova", 'name: Nova "the spark" N.'));
  expect(c.name).toBe('Nova "the spark" N.');
});

test("unindented links list items still count", () => {
  const c = parse(CARD.replace("  - https://example.com/nova", "- https://example.com/nova"));
  expect(c.links).toEqual(["https://example.com/nova"]);
});

test("missing section becomes empty string", () => {
  const c = parse(CARD.replace(/## Toasts 祝酒註[\s\S]*$/, ""));
  expect(c.sections.toasts).toBe("");
});
