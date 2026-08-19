// build/parse.ts
export type SectionKey = "style" | "procedures" | "intro" | "brought" | "toasts";

export interface GuestCard {
  guest: string;
  slug: string;
  name: string;
  arrived: string;
  links: string[];
  sections: Record<SectionKey, string>;
}

const HEADINGS: [SectionKey, RegExp][] = [
  ["style", /^##\s*Party Style/],
  ["procedures", /^##\s*Special Celebration Procedures/],
  ["intro", /^##\s*Self-Introduction/],
  ["brought", /^##\s*Brought & Taking/],
  ["toasts", /^##\s*Toasts/],
];

// A wrapping pair of single or double quotes comes off; interior
// quotes are the guest's own and stay.
function unquote(v: string): string {
  const t = v.trim();
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))))
    return t.slice(1, -1);
  return t;
}

export function parse(md: string): GuestCard {
  // Guests arrive from every OS and editor: normalize CRLF, tolerate
  // trailing whitespace on the fences.
  const src = md.replace(/\r\n?/g, "\n");
  const m = src.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*\n?([\s\S]*)$/);
  if (!m) throw new Error("missing frontmatter");
  const [, fm, body] = m;

  const meta: Record<string, string> = {};
  const links: string[] = [];
  let inLinks = false;
  for (const line of fm.split("\n")) {
    if (/^links:\s*$/.test(line)) { inLinks = true; continue; }
    const li = line.match(/^\s*-\s+(.+)$/);
    if (inLinks && li) { links.push(unquote(li[1])); continue; }
    inLinks = false;
    const kv = line.match(/^([a-z-]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = unquote(kv[2]);
  }

  const buf: Partial<Record<SectionKey, string[]>> = {};
  let current: SectionKey | null = null;
  for (const line of body.split("\n")) {
    const head = HEADINGS.find(([, re]) => re.test(line));
    if (head) { current = head[0]; buf[current] = []; continue; }
    if (/^##\s/.test(line)) { current = null; continue; }
    if (current) buf[current]!.push(line);
  }
  const sections = {} as Record<SectionKey, string>;
  for (const [key] of HEADINGS) sections[key] = (buf[key] ?? []).join("\n").trim();

  return {
    guest: meta["guest"] ?? "",
    slug: meta["slug"] ?? "",
    name: meta["name"] ?? "",
    arrived: meta["arrived"] ?? "",
    links,
    sections,
  };
}
