import type { ClassId, Faction, ProfessionId, RaceId } from "./types";
import { zoneById } from "@/data/zones";
import { raceById } from "@/data/races";
import { MAX_SKILL, PRIMARY_PROFESSION_LIMIT, professionById } from "@/data/professions";
import { xpForLevel } from "@/data/xp";

export const STORAGE_KEY = "wowf-companion:v1";
export const SCHEMA_VERSION = 1;

export type SecondaryProfessionId = "cooking" | "fishing" | "firstaid";

export interface PrimaryProfession {
  id: ProfessionId;
  skill: number;
}

export interface ProgressState {
  version: typeof SCHEMA_VERSION;
  settings: {
    faction: Faction;
    classId: ClassId;
    raceId: RaceId | null;
    level: number;
    /** XP innerhalb der aktuellen Stufe */
    xp: number;
    currentZoneId: string | null;
  };
  /** Laufende Spielsitzung für XP/Stunde (null = keine) */
  session: { startedAt: number; startTotalXp: number } | null;
  /** Stations-ID → Zeitstempel (ms) der Erledigung */
  completedSteps: Record<string, number>;
  professions: {
    primary: PrimaryProfession[];
    secondary: Partial<Record<SecondaryProfessionId, number>>;
  };
  notes: string;
  updatedAt: string;
}

export const DEFAULT_STATE: ProgressState = Object.freeze({
  version: SCHEMA_VERSION,
  settings: { faction: "alliance", classId: "druid", raceId: null, level: 1, xp: 0, currentZoneId: null },
  session: null,
  completedSteps: {},
  professions: { primary: [], secondary: {} },
  notes: "",
  updatedAt: "1970-01-01T00:00:00.000Z",
}) as ProgressState;

export function createDefaultState(): ProgressState {
  return structuredClone(DEFAULT_STATE);
}

const FACTIONS: Faction[] = ["alliance", "horde"];
const CLASSES: ClassId[] = ["paladin", "priest", "druid"];
const SECONDARY: SecondaryProfessionId[] = ["cooking", "fishing", "firstaid"];

export function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return 1;
  return Math.min(60, Math.max(1, Math.round(level)));
}

/** Begrenzt XP auf 0 bis (benötigte XP der Stufe − 1). */
export function clampXp(xp: number, level: number): number {
  if (!Number.isFinite(xp)) return 0;
  const max = xpForLevel(level);
  return max === 0 ? 0 : Math.min(max - 1, Math.max(0, Math.round(xp)));
}

export function clampSkill(skill: number): number {
  if (!Number.isFinite(skill)) return 0;
  return Math.min(MAX_SKILL, Math.max(0, Math.round(skill)));
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export type ParseResult = { ok: true; state: ProgressState; warnings: string[] } | { ok: false; error: string };

/**
 * Validiert und normalisiert importierte bzw. gespeicherte Daten.
 * Unbekannte Felder werden verworfen, ungültige Werte auf sichere Standards gesetzt.
 */
export function parseProgress(input: unknown): ParseResult {
  if (!isRecord(input)) return { ok: false, error: "Die Datei enthält kein gültiges Fortschritts-Objekt." };
  if (input.version !== SCHEMA_VERSION) {
    return { ok: false, error: `Nicht unterstützte Version: ${String(input.version)} (erwartet ${SCHEMA_VERSION}).` };
  }
  const warnings: string[] = [];
  const state = createDefaultState();

  const settings = isRecord(input.settings) ? input.settings : {};
  if (FACTIONS.includes(settings.faction as Faction)) state.settings.faction = settings.faction as Faction;
  else warnings.push("Fraktion ungültig – Standard verwendet.");
  if (CLASSES.includes(settings.classId as ClassId)) state.settings.classId = settings.classId as ClassId;
  else warnings.push("Klasse ungültig – Standard verwendet.");
  if (typeof settings.raceId === "string" && raceById.has(settings.raceId as RaceId)) {
    state.settings.raceId = settings.raceId as RaceId;
  }
  if (typeof settings.level === "number") state.settings.level = clampLevel(settings.level);
  if (typeof settings.xp === "number") state.settings.xp = clampXp(settings.xp, state.settings.level);
  if (typeof settings.currentZoneId === "string" && zoneById.has(settings.currentZoneId)) {
    state.settings.currentZoneId = settings.currentZoneId;
  }

  if (
    isRecord(input.session) &&
    typeof input.session.startedAt === "number" &&
    typeof input.session.startTotalXp === "number" &&
    Number.isFinite(input.session.startedAt) &&
    Number.isFinite(input.session.startTotalXp)
  ) {
    state.session = { startedAt: input.session.startedAt, startTotalXp: Math.max(0, input.session.startTotalXp) };
  }

  if (isRecord(input.completedSteps)) {
    for (const [id, ts] of Object.entries(input.completedSteps)) {
      if (typeof ts === "number" && Number.isFinite(ts)) state.completedSteps[id] = ts;
      else if (ts === true) state.completedSteps[id] = 0;
    }
  }

  const prof = isRecord(input.professions) ? input.professions : {};
  if (Array.isArray(prof.primary)) {
    for (const p of prof.primary) {
      if (!isRecord(p) || typeof p.id !== "string") continue;
      const def = professionById.get(p.id as ProfessionId);
      if (!def || def.kind === "secondary") continue;
      if (state.professions.primary.some((x) => x.id === def.id)) continue;
      if (state.professions.primary.length >= PRIMARY_PROFESSION_LIMIT) {
        warnings.push("Mehr als zwei Hauptberufe – überzählige verworfen.");
        break;
      }
      state.professions.primary.push({ id: def.id, skill: clampSkill(Number(p.skill)) });
    }
  }
  if (isRecord(prof.secondary)) {
    for (const id of SECONDARY) {
      const val = prof.secondary[id];
      if (typeof val === "number") state.professions.secondary[id] = clampSkill(val);
    }
  }

  if (typeof input.notes === "string") state.notes = input.notes.slice(0, 20000);
  if (typeof input.updatedAt === "string") state.updatedAt = input.updatedAt;

  return { ok: true, state, warnings };
}

export function serializeProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

/** Dateiname für den Export, z. B. wow-forever-fortschritt-2026-10-19.json */
export function exportFileName(date = new Date()): string {
  return `wow-forever-fortschritt-${date.toISOString().slice(0, 10)}.json`;
}
