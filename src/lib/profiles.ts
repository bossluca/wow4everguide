import { createDefaultState, parseProgress, type ProgressState } from "./progress";
import type { ClassId, Faction, RaceId } from "./types";

export const APP_STORAGE_KEY = "wowf-companion:v2";
/** Speicherschlüssel der Version mit nur einem Charakter – wird beim Start übernommen. */
export const LEGACY_STORAGE_KEY = "wowf-companion:v1";
export const APP_SCHEMA_VERSION = 2;
export const MAX_PROFILES = 20;
export const MAX_NAME_LENGTH = 40;

export interface Profile {
  id: string;
  name: string;
  state: ProgressState;
}

export interface AppData {
  version: typeof APP_SCHEMA_VERSION;
  activeId: string;
  profiles: Profile[];
}

/** Schnellstart-Vorlagen für neue Charaktere. */
export const profilePresets: { id: string; name: string; faction: Faction; classId: ClassId; raceId: RaceId }[] = [
  { id: "human-paladin", name: "Mensch Paladin", faction: "alliance", classId: "paladin", raceId: "human" },
  { id: "human-warlock", name: "Mensch Hexenmeister", faction: "alliance", classId: "warlock", raceId: "human" },
];

export function newId(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c) return c.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function cleanName(name: unknown, fallback: string): string {
  const text = typeof name === "string" ? name.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH) : "";
  return text || fallback;
}

/** Hängt bei doppelten Namen " (2)", " (3)" … an, damit der Charakterwechsel eindeutig bleibt. */
export function uniqueName(name: string, taken: string[]): string {
  const used = new Set(taken.map((n) => n.toLowerCase()));
  if (!used.has(name.toLowerCase())) return name;
  const base = name.slice(0, MAX_NAME_LENGTH - 4);
  for (let i = 2; ; i++) {
    const candidate = `${base} (${i})`;
    if (!used.has(candidate.toLowerCase())) return candidate;
  }
}

export function createProfile(name: string, state: ProgressState = createDefaultState()): Profile {
  return { id: newId(), name: cleanName(name, "Charakter"), state };
}

export function createDefaultAppData(): AppData {
  const profile = createProfile("Charakter 1");
  return { version: APP_SCHEMA_VERSION, activeId: profile.id, profiles: [profile] };
}

/** Feste, einfrorene Daten für das Server-Rendering. */
export const DEFAULT_APP_DATA: AppData = Object.freeze({
  version: APP_SCHEMA_VERSION,
  activeId: "default",
  profiles: [{ id: "default", name: "Charakter 1", state: createDefaultState() }],
}) as AppData;

export function activeProfile(data: AppData): Profile {
  return data.profiles.find((p) => p.id === data.activeId) ?? data.profiles[0];
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

export type ProfilesResult = { ok: true; profiles: Profile[]; activeId: string; warnings: string[] } | { ok: false; error: string };

/**
 * Liest Gespeichertes oder Importiertes: Version 2 (mehrere Charaktere) oder Version 1 (ein Charakter).
 * Ungültige Charaktere werden übersprungen, Namen und IDs bereinigt.
 */
export function parseProfiles(input: unknown): ProfilesResult {
  if (!isRecord(input)) return { ok: false, error: "Die Datei enthält keine gültigen Daten." };

  if (input.version === 1) {
    const parsed = parseProgress(input);
    if (!parsed.ok) return parsed;
    const profile = createProfile("Importierter Charakter", parsed.state);
    return { ok: true, profiles: [profile], activeId: profile.id, warnings: parsed.warnings };
  }

  if (input.version !== APP_SCHEMA_VERSION) {
    return { ok: false, error: `Nicht unterstützte Version: ${String(input.version)} (erwartet 1 oder ${APP_SCHEMA_VERSION}).` };
  }
  if (!Array.isArray(input.profiles)) return { ok: false, error: "Die Datei enthält keine Charakterliste." };

  const warnings: string[] = [];
  const profiles: Profile[] = [];
  const seen = new Set<string>();
  for (const raw of input.profiles) {
    if (profiles.length >= MAX_PROFILES) {
      warnings.push(`Mehr als ${MAX_PROFILES} Charaktere – überzählige verworfen.`);
      break;
    }
    if (!isRecord(raw)) continue;
    const parsed = parseProgress(raw.state);
    if (!parsed.ok) {
      warnings.push(`Charakter „${cleanName(raw.name, "?")}“ übersprungen: ${parsed.error}`);
      continue;
    }
    let id = typeof raw.id === "string" && raw.id && raw.id.length <= 80 ? raw.id : newId();
    if (seen.has(id)) id = newId();
    seen.add(id);
    profiles.push({ id, name: cleanName(raw.name, `Charakter ${profiles.length + 1}`), state: parsed.state });
    warnings.push(...parsed.warnings);
  }
  if (profiles.length === 0) return { ok: false, error: "Die Datei enthält keinen gültigen Charakter." };
  const activeId = typeof input.activeId === "string" && seen.has(input.activeId) ? input.activeId : profiles[0].id;
  return { ok: true, profiles, activeId, warnings };
}

export function serializeProfiles(profiles: Profile[], activeId: string): string {
  const data: AppData = { version: APP_SCHEMA_VERSION, activeId, profiles };
  return JSON.stringify(data, null, 2);
}

/** Dateiname für den Export, z. B. wow-forever-mensch-paladin-2026-11-07.json */
export function profileExportFileName(name: string | null, date = new Date()): string {
  const slug = (name ?? "alle-charaktere")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `wow-forever-${slug || "charakter"}-${date.toISOString().slice(0, 10)}.json`;
}
