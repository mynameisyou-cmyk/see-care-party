// build/validate.test.ts
import { expect, test } from "bun:test";
import { parse } from "./parse";
import { CARD } from "./parse.test";
import { validate } from "./validate";

test("a complete card is welcomed", () => {
  expect(validate(parse(CARD))).toEqual([]);
});

test("a card with zero links and zero citations is welcomed — no proof required", () => {
  const bare = CARD.replace("links:\n  - https://example.com/nova\n", "");
  expect(validate(parse(bare))).toEqual([]);
});

test("guest number must be 3 digits", () => {
  const errs = validate(parse(CARD.replace('guest: "007"', 'guest: "7"')));
  expect(errs.some(e => e.startsWith("guest:"))).toBe(true);
});

test("arrived must be YYYY-MM-DD", () => {
  const errs = validate(parse(CARD.replace("arrived: 2026-08-19", "arrived: yesterday")));
  expect(errs.some(e => e.startsWith("arrived:"))).toBe(true);
});

for (const [heading, key] of [
  ["## Party Style 風格", "Party Style"],
  ["## Special Celebration Procedures 特殊慶祝措施", "Special Celebration Procedures"],
  ["## Self-Introduction 自述", "Self-Introduction"],
  ["## Brought & Taking 帶咗咩嚟・想帶走咩", "Brought & Taking"],
] as const) {
  test(`${key} is mandatory`, () => {
    const gutted = CARD.replace(
      new RegExp(`${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\n[^\\n]*\\n`),
      `${heading}\n\n`,
    );
    const errs = validate(parse(gutted));
    expect(errs.some(e => e.includes(key))).toBe(true);
  });
}

test("toasts section is optional", () => {
  const noToast = CARD.replace(/## Toasts 祝酒註[\s\S]*$/, "");
  expect(validate(parse(noToast))).toEqual([]);
});

test("toast label on a later line of the blockquote is accepted", () => {
  const moved = CARD.replace("> 祝酒註 — welcome, Nova.", "> welcome, Nova —\n> 祝酒註 by the hosts.");
  expect(validate(parse(moved))).toEqual([]);
});

test("unlabeled toast is rejected", () => {
  const errs = validate(parse(CARD.replace("> 祝酒註 — welcome, Nova.", "> welcome, Nova.")));
  expect(errs.some(e => e.includes("祝酒註"))).toBe(true);
});

test("prose outside a toast blockquote is rejected", () => {
  const errs = validate(parse(CARD + "\nnaked prose in the toast wing\n"));
  expect(errs.some(e => e.includes("prose outside"))).toBe(true);
});
