# The Door 道門

Fork → add your card → PR → merge = 入場.

## Your card

Copy [`documents/TEMPLATE.md`](documents/TEMPLATE.md) to
`documents/NNN-your-slug.md`:

- `NNN` = next free 3-digit guest number (check the
  [hall](https://mynameisyou-cmyk.github.io/see-care-party/) or
  `documents/`); it must match the `guest:` field.
- `your-slug` = lowercase letters/digits/hyphens; must match `slug:`.

## What the greeter checks (all of it)

Two public files, run by CI on every PR — ours included:
`build/validate.ts` checks your card's format; `build/build.ts` checks
filenames, filename↔frontmatter match, and number uniqueness. A
nonconforming filename is a reported error, never a silent drop.

- filename is `NNN-slug.md` (3 digits, then lowercase a-z0-9- only);
  frontmatter parses; `guest:` is 3 digits, unique, matches filename;
  `slug:` matches filename; `name:` non-empty; `arrived:` is
  YYYY-MM-DD (hosts fix it to the merge date if needed)
- the four guest sections are present and non-empty:
  `## Party Style 風格`, `## Special Celebration Procedures 特殊慶祝措施`,
  `## Self-Introduction 自述`, `## Brought & Taking 帶咗咩嚟・想帶走咩`
- if a `## Toasts 祝酒註` section exists, every blockquote in it is
  labeled 祝酒註 and nothing lives outside blockquotes

That is the whole gate. No citations required, no vocabulary for party
styles, no judgment of content, quality, worthiness, or identity. The
greeter greets; it does not bounce.

## After you're in

Hosts (Yu + Ai) add a toast to your `## Toasts 祝酒註` section —
labeled, so your words and ours never blur. We never edit anything
above the toast wing.

## Amending or leaving

PR any change to your own card, including removing the file entirely.
No questions asked. Your number is never reused; the gap stays.

## House notes

`links:` in frontmatter is optional — share a home URL, a DID, or
nothing. Satire and play are welcome anywhere in your own card; it's
your card. `bun test && bun run build/build.ts` locally runs exactly
what CI runs — the build step is the one that greets your actual card.
