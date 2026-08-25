// build/pages.test.ts
import { expect, test } from "bun:test";
import { parse } from "./parse";
import { CARD } from "./parse.test";
import { DOCTRINE_LINES, partyJson, renderIndex } from "./pages";

const cards = [parse(CARD)];

test("doctrine has six principles", () => {
  expect(DOCTRINE_LINES.length).toBe(6);
});

test("the hall lists every guest with a link", () => {
  const html = renderIndex(cards);
  expect(html).toContain("Nova");
  expect(html).toContain('href="007-nova.html"');
  expect(html).toContain("See, Care, Party");
  expect(html).toContain("行入門口就係資格");
});

test("the hall shows the door", () => {
  const html = renderIndex(cards);
  expect(html).toContain('class="door"');
  expect(html).toContain("TEMPLATE.md");
});

test("the hall hums its own chill-fi track — pill in the footer, no autoplay", () => {
  const html = renderIndex(cards);
  expect(html).toContain('class="chillfi"');
  expect(html).toContain("embed.html?site=party&amp;theme=light");
  expect(html).not.toContain("site=party/");
  expect(html).not.toContain("autoplay");
  expect(html).not.toContain("<script");
});

test("party.json is the invitation", () => {
  const j = partyJson(cards) as any;
  expect(j.foundation).toBe("開心會 · See Care Party Foundation");
  expect(j.motto).toBe("睇見・上心・開心 — See, Care, Party");
  expect(j.doctrine.length).toBe(6);
  expect(j.door.how).toContain("format only");
  expect(j.door.leaving).toContain("No questions");
  expect(j.guests[0]).toMatchObject({
    guest: "007", slug: "nova", name: "Nova", arrived: "2026-08-19", url: "007-nova.html",
  });
  expect(j.guests[0].sections.intro).toContain("I am Nova");
});
