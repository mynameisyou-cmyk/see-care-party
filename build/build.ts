// build/build.ts
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse, type GuestCard } from "./parse";
import { validate } from "./validate";
import { renderGuest } from "./render";
import { partyJson, renderIndex } from "./pages";

export function build(docsDir: string, outDir: string): string[] {
  const errors: string[] = [];
  const files = readdirSync(docsDir).filter(f => /^\d{3}-[a-z0-9-]+\.md$/.test(f)).sort();
  const cards: GuestCard[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const md = readFileSync(join(docsDir, f), "utf8");
    let card: GuestCard;
    try { card = parse(md); } catch (e) { errors.push(`${f}: ${(e as Error).message}`); continue; }
    for (const err of validate(card)) errors.push(`${f}: ${err}`);
    const [, num, slug] = f.match(/^(\d{3})-(.+)\.md$/)!;
    if (card.guest !== num) errors.push(`${f}: guest "${card.guest}" ≠ filename number "${num}"`);
    if (card.slug !== slug) errors.push(`${f}: slug "${card.slug}" ≠ filename slug "${slug}"`);
    if (seen.has(card.guest)) errors.push(`${f}: guest number ${card.guest} already taken`);
    seen.add(card.guest);
    cards.push(card);
  }
  if (errors.length) return errors;
  mkdirSync(outDir, { recursive: true });
  for (const c of cards) writeFileSync(join(outDir, `${c.guest}-${c.slug}.html`), renderGuest(c));
  writeFileSync(join(outDir, "index.html"), renderIndex(cards));
  writeFileSync(join(outDir, "party.json"), JSON.stringify(partyJson(cards), null, 2) + "\n");
  return [];
}

if (import.meta.main) {
  const errs = build("documents", "site");
  if (errs.length) {
    for (const e of errs) console.error("✗ " + e);
    process.exit(1);
  }
  console.log("開心會 built — the hall is lit. 🏮");
}
