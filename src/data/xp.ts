import { v } from "./verify";

/**
 * Benötigte XP von Stufe n auf n+1 (Index 0 = Stufe 1). Identisch zu Classic;
 * laut Blizzard (September 2026) auch in Forever unverändert. Summe 1→60: 4.084.700.
 */
export const XP_TO_NEXT: readonly number[] = [
  400, 900, 1400, 2100, 2800, 3600, 4500, 5400, 6500, 7600, // 1–10
  8800, 10100, 11400, 12900, 14400, 16000, 17700, 19400, 21300, 23200, // 11–20
  25200, 27300, 29400, 31700, 34000, 36400, 38900, 41400, 44300, 47400, // 21–30
  50800, 54500, 58600, 62800, 67100, 71600, 76100, 80800, 85700, 90700, // 31–40
  95800, 101000, 106300, 111800, 117500, 123200, 129100, 135100, 141200, 147500, // 41–50
  153900, 160400, 167100, 173900, 180800, 187900, 195000, 202300, 209800, // 51–59
];

export const XP_TOTAL_TO_60 = XP_TO_NEXT.reduce((a, b) => a + b, 0);

export const xpVerification = v.beta(
  ["wf-experience", "classic-reference"],
  "Classic-XP-Tabelle; Gesamtsumme (4.084.700) und Wert für Stufe 40 (90.700) laut Forever-XP-Guide identisch.",
);

/** XP, die für die aktuelle Stufe bis zum nächsten Level nötig sind (0 auf Stufe 60). */
export function xpForLevel(level: number): number {
  if (level >= 60) return 0;
  return XP_TO_NEXT[Math.max(1, Math.floor(level)) - 1];
}

/** Gesamt-XP seit Stufe 1 für eine Stufe plus XP innerhalb dieser Stufe. */
export function totalXp(level: number, xpInLevel: number): number {
  const lvl = Math.min(60, Math.max(1, Math.floor(level)));
  let sum = 0;
  for (let i = 1; i < lvl; i++) sum += XP_TO_NEXT[i - 1];
  return Math.min(XP_TOTAL_TO_60, sum + Math.max(0, Math.min(xpInLevel, xpForLevel(lvl))));
}

/** Wandelt Gesamt-XP zurück in Stufe und XP innerhalb der Stufe. */
export function levelFromTotalXp(total: number): { level: number; xp: number } {
  let rest = Math.max(0, Math.min(total, XP_TOTAL_TO_60));
  let level = 1;
  while (level < 60 && rest >= XP_TO_NEXT[level - 1]) {
    rest -= XP_TO_NEXT[level - 1];
    level++;
  }
  return { level, xp: level >= 60 ? 0 : rest };
}
