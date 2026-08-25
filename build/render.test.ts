// build/render.test.ts
import { expect, test } from "bun:test";
import { parse } from "./parse";
import { CARD } from "./parse.test";
import { mdToHtml, renderGuest } from "./render";

test("mdToHtml renders inline markdown", () => {
  const html = mdToHtml("**bold** and [link](https://x.example)");
  expect(html).toContain("<strong>bold</strong>");
  expect(html).toContain('<a href="https://x.example">link</a>');
});

test("mdToHtml renders lists and blockquotes", () => {
  expect(mdToHtml("- one\n- two")).toBe("<ul><li>one</li><li>two</li></ul>");
  expect(mdToHtml("> hello")).toBe("<blockquote><p>hello</p></blockquote>");
});

test("mdToHtml escapes HTML", () => {
  expect(mdToHtml("<script>alert(1)</script>")).not.toContain("<script>");
});

test("non-https links render as text, never as hyperlinks", () => {
  const c = parse(CARD.replace("https://example.com/nova", "javascript:alert(1)"));
  const html = renderGuest(c);
  expect(html).not.toContain('href="javascript:');
  expect(html).toContain("javascript:alert(1)");
});

test("markup inside code spans is left alone", () => {
  expect(mdToHtml("`**not bold**`")).toBe("<p><code>**not bold**</code></p>");
});

test("guest page carries badge, name, and all four guest sections", () => {
  const html = renderGuest(parse(CARD));
  expect(html).toContain("Guest #007");
  expect(html).toContain("Nova");
  expect(html).toContain("Party Style 風格");
  expect(html).toContain("Special Celebration Procedures 特殊慶祝措施");
  expect(html).toContain("Self-Introduction 自述");
  expect(html).toContain("Brought &amp; Taking 帶咗咩嚟・想帶走咩");
});

test("toasts render in their own labeled wing", () => {
  const html = renderGuest(parse(CARD));
  expect(html).toContain('class="toasts"');
  expect(html).toContain("主人家回敬");
  expect(html).toContain("welcome, Nova");
});

test("guest page carries its own chill-fi pill, never autoplaying", () => {
  const html = renderGuest(parse(CARD));
  expect(html).toContain('class="chillfi"');
  expect(html).toContain("embed.html?site=party/007&amp;theme=light");
  expect(html).toContain('loading="lazy"');
  expect(html).toContain("撳 ▶ 先響");
  expect(html).not.toContain("autoplay");
  expect(html).not.toContain("<script");
});

test("no toasts, no toast wing", () => {
  const html = renderGuest(parse(CARD.replace(/## Toasts 祝酒註[\s\S]*$/, "")));
  expect(html).not.toContain('class="toasts"');
});
