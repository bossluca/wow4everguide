import { describe, expect, it } from "vitest";
import { createDefaultState, exportFileName, parseProgress, serializeProgress, clampLevel } from "@/lib/progress";

describe("parseProgress", () => {
  it("akzeptiert einen exportierten Zustand verlustfrei (Round-Trip)", () => {
    const s = createDefaultState();
    s.settings = { faction: "horde", classId: "paladin", raceId: "undead", level: 27, currentZoneId: "hillsbrad" };
    s.completedSteps = { "h-hb-1": 1700000000000 };
    s.professions = { primary: [{ id: "herbalism", skill: 140 }, { id: "mining", skill: 120 }], secondary: { firstaid: 150 } };
    s.notes = "Test";
    const parsed = parseProgress(JSON.parse(serializeProgress(s)));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.state).toEqual(s);
  });

  it("lehnt falsche Versionen und Nicht-Objekte ab", () => {
    expect(parseProgress(null).ok).toBe(false);
    expect(parseProgress([]).ok).toBe(false);
    expect(parseProgress({ version: 99 }).ok).toBe(false);
  });

  it("normalisiert ungültige Werte", () => {
    const parsed = parseProgress({
      version: 1,
      settings: { faction: "pirates", classId: "mage", raceId: "murloc", level: 999, currentZoneId: "atlantis" },
      completedSteps: { a: "x", b: 5, c: true },
      professions: {
        primary: [{ id: "herbalism", skill: 9999 }, { id: "herbalism", skill: 1 }, { id: "cooking", skill: 5 }, { id: "mining", skill: -3 }, { id: "alchemy", skill: 3 }],
        secondary: { fishing: 400, bogus: 3 },
      },
      notes: 42,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const s = parsed.state;
    expect(s.settings.faction).toBe("alliance");
    expect(s.settings.classId).toBe("druid");
    expect(s.settings.raceId).toBeNull();
    expect(s.settings.level).toBe(60);
    expect(s.settings.currentZoneId).toBeNull();
    expect(s.completedSteps).toEqual({ b: 5, c: 0 });
    expect(s.professions.primary).toEqual([
      { id: "herbalism", skill: 300 },
      { id: "mining", skill: 0 },
    ]);
    expect(s.professions.secondary).toEqual({ fishing: 300 });
    expect(s.notes).toBe("");
    expect(parsed.warnings.length).toBeGreaterThan(0);
  });

  it("begrenzt Stufen auf 1–60", () => {
    expect(clampLevel(0)).toBe(1);
    expect(clampLevel(61)).toBe(60);
    expect(clampLevel(Number.NaN)).toBe(1);
    expect(clampLevel(12.6)).toBe(13);
  });

  it("erzeugt einen datierten Dateinamen", () => {
    expect(exportFileName(new Date("2026-11-04T12:00:00Z"))).toBe("wow-forever-fortschritt-2026-11-04.json");
  });
});
