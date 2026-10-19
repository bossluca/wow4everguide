import { allSections } from "@/data/route";
import { zones } from "@/data/zones";
import { quests } from "@/data/quests";
import { dungeons } from "@/data/dungeons";
import { classGuides } from "@/data/classes";
import { professions } from "@/data/professions";
import { resources } from "@/data/resources";
import { factionLabel } from "@/components/shared/faction-badge";

export interface SearchItem {
  id: string;
  kind: "Abschnitt" | "Gebiet" | "Quest" | "Dungeon" | "Klasse" | "Beruf" | "Ressource";
  title: string;
  subtitle: string;
  href: string;
  haystack: string;
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export const searchIndex: SearchItem[] = [
  ...allSections.map((s) => ({
    id: `sec-${s.id}`,
    kind: "Abschnitt" as const,
    title: s.title,
    subtitle: `${factionLabel[s.faction]} · Stufe ${s.levelMin}–${s.levelMax}`,
    href: `/route?faction=${s.faction}#${s.id}`,
    haystack: norm([s.title, s.summary, ...s.hubs, ...s.steps.map((x) => x.text)].join(" ")),
  })),
  ...zones.map((z) => ({
    id: `zone-${z.id}`,
    kind: "Gebiet" as const,
    title: z.name,
    subtitle: `Stufe ${z.levelMin}–${z.levelMax} · ${factionLabel[z.faction]}`,
    href: `/route?zone=${z.id}`,
    haystack: norm([z.name, ...(z.notes ?? [])].join(" ")),
  })),
  ...quests.map((q) => ({
    id: `quest-${q.id}`,
    kind: "Quest" as const,
    title: q.name,
    subtitle: q.level ? `Stufe ~${q.level}` : "Quest",
    href: `/route?zone=${q.zoneId}`,
    haystack: norm([q.name, q.note ?? ""].join(" ")),
  })),
  ...dungeons.map((d) => ({
    id: `dungeon-${d.id}`,
    kind: "Dungeon" as const,
    title: d.name,
    subtitle: `Stufe ${d.levelMin}–${d.levelMax}${d.isNew ? " · Neu in Forever" : ""}`,
    href: `/route?zone=${d.zoneId}`,
    haystack: norm([d.name, d.valueNote].join(" ")),
  })),
  ...classGuides.map((c) => ({
    id: `class-${c.id}`,
    kind: "Klasse" as const,
    title: c.name,
    subtitle: c.soloSpec.name,
    href: `/classes?tab=${c.id}`,
    haystack: norm([c.name, c.summary, c.soloSpec.name].join(" ")),
  })),
  ...professions.map((p) => ({
    id: `prof-${p.id}`,
    kind: "Beruf" as const,
    title: p.name,
    subtitle: p.kind === "gathering" ? "Sammelberuf" : p.kind === "crafting" ? "Herstellungsberuf" : "Nebenberuf",
    href: `/professions`,
    haystack: norm([p.name, p.summary].join(" ")),
  })),
  ...resources.map((r) => ({
    id: `res-${r.id}`,
    kind: "Ressource" as const,
    title: r.name,
    subtitle: `Skill ${r.skill}`,
    href: `/professions?resource=${r.id}`,
    haystack: norm(r.name),
  })),
];

export function search(query: string, limit = 20): SearchItem[] {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return searchIndex
    .map((item) => {
      const title = norm(item.title);
      let score = 0;
      for (const t of terms) {
        if (title.startsWith(t)) score += 3;
        else if (title.includes(t)) score += 2;
        else if (item.haystack.includes(t)) score += 1;
        else return { item, score: -1 };
      }
      return { item, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}
