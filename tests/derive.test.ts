import { describe, expect, it } from "vitest";
import { createDefaultState } from "@/lib/progress";
import {
  currentSection,
  levelPercent,
  nextSection,
  nextTasks,
  resourcesForZone,
  routeTotals,
  sectionsForPlayer,
  skinningRangeForZone,
} from "@/lib/derive";
import { skinningSkillForLevel } from "@/data/resources";
import { search } from "@/lib/search";

function state(patch: Partial<ReturnType<typeof createDefaultState>["settings"]> = {}) {
  const s = createDefaultState();
  s.settings = { ...s.settings, ...patch };
  return s;
}

describe("Routenableitung", () => {
  it("filtert Startgebiete nach Volk", () => {
    const list = sectionsForPlayer("alliance", "nightelf");
    expect(list.some((s) => s.id === "a-teldrassil")).toBe(true);
    expect(list.some((s) => s.id === "a-elwynn")).toBe(false);
    expect(list.some((s) => s.id === "a-wetlands")).toBe(true);
  });

  it("zeigt ohne Volk nur Startzweige, die zur Klasse passen", () => {
    expect(currentSection(state({ classId: "druid", level: 1 }))?.id).toBe("a-teldrassil");
    expect(currentSection(state({ classId: "paladin", level: 1 }))?.id).toBe("a-elwynn");
    const ids = sectionsForPlayer("horde", null, "paladin").map((s) => s.id);
    expect(ids).toContain("h-tirisfal");
    expect(ids).not.toContain("h-mulgore");
  });

  it("findet den aktuellen Abschnitt aus der Stufe", () => {
    expect(currentSection(state({ raceId: "human", level: 1 }))?.id).toBe("a-elwynn");
    expect(currentSection(state({ raceId: "human", level: 12 }))?.id).toBe("a-westfall");
    expect(currentSection(state({ faction: "horde", raceId: "tauren", level: 15 }))?.id).toBe("h-barrens");
  });

  it("bevorzugt das gewählte Gebiet", () => {
    expect(currentSection(state({ raceId: "human", level: 12, currentZoneId: "wetlands" }))?.id).toBe("a-wetlands");
  });

  it("überspringt abgeschlossene Abschnitte", () => {
    const s = state({ raceId: "human", level: 5 });
    const elwynn = currentSection(s)!;
    for (const st of elwynn.steps) if (st.important) s.completedSteps[st.id] = 1;
    expect(currentSection(s)?.id).toBe("a-westfall");
  });

  it("empfiehlt den passenden Folgeabschnitt je Zweig", () => {
    const human = state({ raceId: "human", level: 12 });
    expect(nextSection(human)?.id).toBe("a-redridge");
    const elf = state({ raceId: "nightelf", level: 19 });
    expect(currentSection(elf)?.id).toBe("a-ashenvale");
    expect(nextSection(elf)?.id).toBe("a-wetlands");
    const undead = state({ faction: "horde", raceId: "undead", level: 12 });
    expect(nextSection(undead)?.id).toBe("h-barrens");
  });

  it("liefert offene Aufgaben und blendet fremde Klassenschritte aus", () => {
    const paladin = state({ faction: "horde", raceId: "tauren", classId: "paladin", level: 2 });
    const tasks = nextTasks(paladin, 20).map((t) => t.step.id);
    expect(tasks).not.toContain("h-mul-3");
    const druid = state({ faction: "horde", raceId: "tauren", classId: "druid", level: 2 });
    expect(nextTasks(druid, 20).map((t) => t.step.id)).toContain("h-mul-3");
  });

  it("Klassenwechsel behält erledigte Stationen", () => {
    const s = state({ raceId: "human", level: 3 });
    s.completedSteps["a-elw-1"] = 1;
    const before = routeTotals(s).done;
    s.settings.classId = "priest";
    expect(routeTotals(s).done).toBe(before);
  });

  it("berechnet Levelfortschritt", () => {
    expect(levelPercent(1)).toBe(0);
    expect(levelPercent(60)).toBe(100);
    expect(levelPercent(30)).toBe(49);
  });
});

describe("Ressourcen", () => {
  it("bewertet Ressourcen nach Skill", () => {
    const s = state();
    s.professions.primary = [{ id: "mining", skill: 130 }];
    const list = resourcesForZone("wetlands", s);
    const iron = list.find((r) => r.resource.id === "iron")!;
    const gold = list.find((r) => r.resource.id === "gold")!;
    const herb = list.find((r) => r.resource.id === "kingsblood")!;
    expect(iron.advice).toBe("sammelbar");
    expect(iron.detour).toBe(true);
    expect(gold.advice).toBe("bald"); // 130 + 25 >= 155
    expect(herb.advice).toBe("kein-beruf");
  });

  it("berechnet Kürschnerei-Skill nach Classic-Formel", () => {
    expect(skinningSkillForLevel(5)).toBe(1);
    expect(skinningSkillForLevel(15)).toBe(50);
    expect(skinningSkillForLevel(20)).toBe(100);
    expect(skinningSkillForLevel(40)).toBe(200);
    expect(skinningRangeForZone("riverglades")).toBeUndefined();
  });
});

describe("Suche", () => {
  it("findet Gebiete, Ressourcen und Klassen ohne Umlaut-Probleme", () => {
    expect(search("sumpfland")[0]?.title).toContain("Sumpfland");
    expect(search("mithril").some((r) => r.kind === "Ressource")).toBe(true);
    expect(search("druide").some((r) => r.kind === "Klasse")).toBe(true);
    expect(search("dammerwald").some((r) => r.title === "Dämmerwald")).toBe(true);
    expect(search("")).toEqual([]);
  });
});
