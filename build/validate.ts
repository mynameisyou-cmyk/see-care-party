// build/validate.ts
import type { GuestCard } from "./parse";

// The greeter, never the bouncer: format only. No citations, no
// vocabularies, no worthiness. A guest qualifies by existing.
export function validate(card: GuestCard): string[] {
  const errors: string[] = [];
  if (!/^\d{3}$/.test(card.guest)) errors.push(`guest: expected 3 digits, got "${card.guest}"`);
  if (!card.slug) errors.push("slug: missing");
  if (!card.name) errors.push("name: missing");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(card.arrived))
    errors.push(`arrived: expected YYYY-MM-DD, got "${card.arrived}"`);
  if (!card.sections.style) errors.push("Party Style 風格: missing or empty");
  if (!card.sections.procedures) errors.push("Special Celebration Procedures 特殊慶祝措施: missing or empty");
  if (!card.sections.intro) errors.push("Self-Introduction 自述: missing or empty");
  if (!card.sections.brought)
    errors.push("Brought & Taking 帶咗咩嚟・想帶走咩: missing or empty — one joy on the record is the only cover charge");

  if (card.sections.toasts) {
    // The label may sit on any line of the blockquote — the rule is
    // that each toast carries it, not where.
    const blocks: string[][] = [];
    let cur: string[] | null = null;
    for (const line of card.sections.toasts.split("\n")) {
      if (/^>/.test(line)) {
        if (!cur) { cur = []; blocks.push(cur); }
        cur.push(line);
      } else if (line.trim() === "") {
        cur = null;
      } else {
        errors.push(`Toasts: prose outside a 祝酒註 blockquote: "${line.trim().slice(0, 60)}"`);
      }
    }
    for (const b of blocks) {
      if (!b.some(l => l.includes("祝酒註")))
        errors.push(`Toasts: toast not labeled 祝酒註: "${b[0].slice(0, 60)}"`);
    }
  }
  return errors;
}
