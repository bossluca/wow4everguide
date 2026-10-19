import { describe, expect, it } from "vitest";
import { allSections, routes } from "@/data/route";
import { zoneById, zones } from "@/data/zones";
import { questById, quests } from "@/data/quests";
import { dungeonById, dungeons } from "@/data/dungeons";
import { resourceById, resources } from "@/data/resources";
import { sourceById } from "@/data/sources";
import { classGuides, classCriteria } from "@/data/classes";
import { professionCombos, professionById, recipes, goldPlan } from "@/data/professions";
import { races } from "@/data/races";
import { phaseHints } from "@/data/hints";
import { foreverFacts } from "@/data/gaps";
import type { Verification } from "@/lib/types";

const verifications: Verification[] = [
  ...zones.map((z) => z.verification),
  ...quests.map((q) => q.verification),
  ...dungeons.map((d) => d.verification),
  ...resources.map((r) => r.verification),
  ...allSections.map((s) => s.verification),
  ...classGuides.flatMap((c) => [
    c.verification,
    ...c.talentMilestones.map((m) => m.verification),
    ...c.abilities.map((a) => a.verification),
    ...c.foreverChanges.map((f) => f.verification),
  ]),
  ...professionCombos.map((c) => c.verification),
  ...recipes.map((r) => r.verification),
  ...goldPlan.map((g) => g.verification),
  ...phaseHints.map((h) => h.verification),
  ...foreverFacts.map((f) => f.verification),
];

describe("Datenintegrität", () => {
  it("hat eindeutige Stations-IDs über beide Fraktionen", () => {
    const ids = allSections.flatMap((s) => s.steps.map((st) => st.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("hat eindeutige Abschnitts-IDs", () => {
    const ids = allSections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("referenziert nur existierende Gebiete, Quests und Dungeons", () => {
    for (const s of allSections) {
      expect(zoneById.has(s.zoneId), s.id).toBe(true);
      for (const q of s.keyQuestIds) expect(questById.has(q), `${s.id} → ${q}`).toBe(true);
      for (const d of s.optionalDungeonIds) expect(dungeonById.has(d), `${s.id} → ${d}`).toBe(true);
      for (const st of s.steps) for (const q of st.questIds ?? []) expect(questById.has(q), `${st.id} → ${q}`).toBe(true);
    }
    for (const q of quests) expect(zoneById.has(q.zoneId), q.id).toBe(true);
    for (const d of dungeons) expect(zoneById.has(d.zoneId), d.id).toBe(true);
  });

  it("referenziert nur existierende Ressourcen", () => {
    for (const z of zones) for (const r of z.resourceIds) expect(resourceById.has(r), `${z.id} → ${r}`).toBe(true);
  });

  it("jeder Verifikationseintrag hat existierende Quellen und ein Prüfdatum", () => {
    for (const v of verifications) {
      expect(v.sourceIds.length).toBeGreaterThan(0);
      expect(v.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const id of v.sourceIds) expect(sourceById.has(id), id).toBe(true);
    }
  });

  it("Routen sind chronologisch und decken 1–60 ab", () => {
    for (const faction of ["alliance", "horde"] as const) {
      const list = routes[faction];
      const orders = list.map((s) => s.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      expect(Math.min(...list.map((s) => s.levelMin))).toBe(1);
      expect(Math.max(...list.map((s) => s.levelMax))).toBe(60);
      for (const s of list) {
        expect(s.levelMin).toBeLessThan(s.levelMax);
        expect(s.leaveWhen.length, s.id).toBeGreaterThan(0);
        expect(s.steps.some((st) => st.important), s.id).toBe(true);
      }
    }
  });

  it("Startgebiete passen zu den Völkern", () => {
    for (const r of races) {
      const start = routes[r.faction].find((s) => s.startRaces?.includes(r.id));
      expect(start, r.id).toBeDefined();
      expect(start!.zoneId).toBe(r.startZoneId);
    }
  });

  it("jede Klasse bewertet jedes Kriterium", () => {
    for (const c of classGuides) {
      for (const crit of classCriteria) expect(c.ratings.some((r) => r.criterionId === crit.id), `${c.id}/${crit.id}`).toBe(true);
    }
  });

  it("Berufskombinationen referenzieren existierende Berufe", () => {
    for (const c of professionCombos) for (const p of c.professions) expect(professionById.has(p)).toBe(true);
  });
});
