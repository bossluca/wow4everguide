import { describe, expect, it } from "vitest";
import { XP_TO_NEXT, XP_TOTAL_TO_60, levelFromTotalXp, totalXp, xpForLevel } from "@/data/xp";
import { createDefaultState } from "@/lib/progress";
import { sessionStats, xpProgress } from "@/lib/derive";

describe("XP-Tabelle", () => {
  it("entspricht den belegten Werten", () => {
    expect(XP_TO_NEXT).toHaveLength(59);
    expect(XP_TOTAL_TO_60).toBe(4084700);
    expect(xpForLevel(40)).toBe(90700);
    expect(xpForLevel(60)).toBe(0);
  });

  it("rechnet Gesamt-XP hin und zurück", () => {
    expect(totalXp(1, 0)).toBe(0);
    expect(totalXp(2, 100)).toBe(500);
    expect(totalXp(60, 0)).toBe(XP_TOTAL_TO_60);
    for (const [lvl, xp] of [[1, 0], [10, 7599], [37, 50000], [59, 1]] as const) {
      expect(levelFromTotalXp(totalXp(lvl, xp))).toEqual({ level: lvl, xp });
    }
    expect(levelFromTotalXp(10 ** 9)).toEqual({ level: 60, xp: 0 });
  });

  it("berechnet XP-Fortschritt", () => {
    const p = xpProgress(2, 450);
    expect(p.total).toBe(850);
    expect(p.levelNeeded).toBe(900);
    expect(p.levelPercent).toBe(50);
    expect(xpProgress(60, 0).percentTo60).toBe(100);
  });
});

describe("Sitzung", () => {
  it("schätzt XP/Stunde erst nach 5 Minuten", () => {
    const s = createDefaultState();
    s.settings.level = 20;
    s.settings.xp = 10000;
    const start = totalXp(20, 0);
    s.session = { startedAt: 0, startTotalXp: start };
    expect(sessionStats(s, 2 * 60000)?.xpPerHour).toBe(0);
    const stats = sessionStats(s, 30 * 60000)!;
    expect(stats.gained).toBe(10000);
    expect(stats.xpPerHour).toBe(20000);
    expect(stats.minutesToNextLevel).toBe(Math.ceil((13200 / 20000) * 60));
    expect(stats.hoursTo60).toBeGreaterThan(0);
  });

  it("liefert null ohne Sitzung", () => {
    expect(sessionStats(createDefaultState(), Date.now())).toBeNull();
  });
});
