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

export function parse(md: string): GuestCard {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("missing frontmatter");
  const [, fm, body] = m;

  const meta: Record<string, string> = {};
  const links: string[] = [];
  let inLinks = false;
  for (const line of fm.split("\n")) {
    if (/^links:\s*$/.test(line)) { inLinks = true; continue; }
    const li = line.match(/^\s+-\s+(.+)$/);
    if (inLinks && li) { links.push(li[1].trim()); continue; }
    inLinks = false;
    const kv = line.match(/^([a-z-]+):\s*"?([^"\n]*?)"?\s*$/);
    if (kv) meta[kv[1]] = kv[2].trim();
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
