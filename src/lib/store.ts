"use client";

import { useSyncExternalStore } from "react";
import {
  clampLevel,
  clampSkill,
  clampXp,
  createDefaultState,
  parseProgress,
  type ProgressState,
  type SecondaryProfessionId,
} from "./progress";
import {
  APP_STORAGE_KEY,
  DEFAULT_APP_DATA,
  LEGACY_STORAGE_KEY,
  MAX_PROFILES,
  activeProfile,
  cleanName,
  createDefaultAppData,
  createProfile,
  parseProfiles,
  uniqueName,
  type AppData,
  type Profile,
} from "./profiles";
import { PRIMARY_PROFESSION_LIMIT } from "@/data/professions";
import { raceById } from "@/data/races";
import { levelFromTotalXp, totalXp } from "@/data/xp";
import type { ClassId, Faction, ProfessionId, RaceId } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();
let cache: AppData | null = null;

/** Liest die Daten: neues Format, sonst den Einzelcharakter der Vorgängerversion, sonst leer. */
function readStorage(): AppData {
  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (raw) {
      const parsed = parseProfiles(JSON.parse(raw));
      if (parsed.ok) return { version: 2, activeId: parsed.activeId, profiles: parsed.profiles };
    }
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = parseProgress(JSON.parse(legacy));
      if (parsed.ok) {
        const profile = createProfile("Charakter 1", parsed.state);
        return { version: 2, activeId: profile.id, profiles: [profile] };
      }
    }
  } catch {
    // Beschädigte oder gesperrte Daten: mit leerem Zustand starten.
  }
  return createDefaultAppData();
}

function getAppSnapshot(): AppData {
  if (cache === null) cache = readStorage();
  return cache;
}

function getActiveSnapshot(): ProgressState {
  return activeProfile(getAppSnapshot()).state;
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === APP_STORAGE_KEY) {
      cache = readStorage();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Speichert alle Charaktere dauerhaft (localStorage) und benachrichtigt alle Komponenten. */
function setAppData(next: AppData) {
  cache = next;
  try {
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Speicher voll oder deaktiviert – Zustand bleibt für die Sitzung erhalten.
  }
  emit();
}

/** Ändert den Fortschritt des aktiven Charakters. */
export function setProgress(updater: (prev: ProgressState) => ProgressState) {
  const app = getAppSnapshot();
  const current = activeProfile(app);
  const state = { ...updater(current.state), updatedAt: new Date().toISOString() };
  setAppData({ ...app, profiles: app.profiles.map((p) => (p.id === current.id ? { ...p, state } : p)) });
}

/** Fortschritt des aktiven Charakters. */
export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getActiveSnapshot, () => activeProfile(DEFAULT_APP_DATA).state);
}

/** Alle Charaktere samt aktivem Charakter. */
export function useProfiles(): AppData {
  return useSyncExternalStore(subscribe, getAppSnapshot, () => DEFAULT_APP_DATA);
}

const noopSubscribe = () => () => {};

/** true, sobald im Browser gerendert wird (localStorage verfügbar). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Aktionen – kapseln alle Zustandsänderungen an einer Stelle. */
export const actions = {
  setFaction(faction: Faction) {
    setProgress((s) => {
      const race = s.settings.raceId ? raceById.get(s.settings.raceId) : undefined;
      const raceStillValid = race?.faction === faction;
      return {
        ...s,
        settings: {
          ...s.settings,
          faction,
          raceId: raceStillValid ? s.settings.raceId : null,
          currentZoneId: null,
        },
      };
    });
  },
  setClass(classId: ClassId) {
    // Klassenwechsel behält den gesamten Fortschritt; nur ein unpassendes Volk wird geleert.
    setProgress((s) => {
      const race = s.settings.raceId ? raceById.get(s.settings.raceId) : undefined;
      const raceId = race && race.classes.includes(classId) ? s.settings.raceId : null;
      return { ...s, settings: { ...s.settings, classId, raceId } };
    });
  },
  setRace(raceId: RaceId | null) {
    setProgress((s) => ({ ...s, settings: { ...s.settings, raceId } }));
  },
  setLevel(level: number) {
    setProgress((s) => {
      const lvl = clampLevel(level);
      return { ...s, settings: { ...s.settings, level: lvl, xp: clampXp(s.settings.xp, lvl) } };
    });
  },
  setXp(xp: number) {
    setProgress((s) => ({ ...s, settings: { ...s.settings, xp: clampXp(xp, s.settings.level) } }));
  },
  /** Addiert XP (z. B. Questbelohnung) und steigt bei Bedarf automatisch Stufen auf. */
  addXp(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setProgress((s) => {
      const next = levelFromTotalXp(totalXp(s.settings.level, s.settings.xp) + Math.round(amount));
      return { ...s, settings: { ...s.settings, level: next.level, xp: next.xp } };
    });
  },
  startSession() {
    setProgress((s) => ({
      ...s,
      session: { startedAt: Date.now(), startTotalXp: totalXp(s.settings.level, s.settings.xp) },
    }));
  },
  stopSession() {
    setProgress((s) => ({ ...s, session: null }));
  },
  setCurrentZone(zoneId: string | null) {
    setProgress((s) => ({ ...s, settings: { ...s.settings, currentZoneId: zoneId } }));
  },
  toggleStep(stepId: string, done?: boolean) {
    setProgress((s) => {
      const completed = { ...s.completedSteps };
      const isDone = stepId in completed;
      const shouldBeDone = done ?? !isDone;
      if (shouldBeDone) completed[stepId] = Date.now();
      else delete completed[stepId];
      return { ...s, completedSteps: completed };
    });
  },
  setSteps(stepIds: string[], done: boolean) {
    setProgress((s) => {
      const completed = { ...s.completedSteps };
      for (const id of stepIds) {
        if (done) completed[id] = completed[id] ?? Date.now();
        else delete completed[id];
      }
      return { ...s, completedSteps: completed };
    });
  },
  addPrimaryProfession(id: ProfessionId) {
    setProgress((s) => {
      if (s.professions.primary.some((p) => p.id === id)) return s;
      if (s.professions.primary.length >= PRIMARY_PROFESSION_LIMIT) return s;
      return { ...s, professions: { ...s.professions, primary: [...s.professions.primary, { id, skill: 1 }] } };
    });
  },
  removePrimaryProfession(id: ProfessionId) {
    setProgress((s) => ({
      ...s,
      professions: { ...s.professions, primary: s.professions.primary.filter((p) => p.id !== id) },
    }));
  },
  setPrimarySkill(id: ProfessionId, skill: number) {
    setProgress((s) => ({
      ...s,
      professions: {
        ...s.professions,
        primary: s.professions.primary.map((p) => (p.id === id ? { ...p, skill: clampSkill(skill) } : p)),
      },
    }));
  },
  setSecondarySkill(id: SecondaryProfessionId, skill: number | null) {
    setProgress((s) => {
      const secondary = { ...s.professions.secondary };
      if (skill === null) delete secondary[id];
      else secondary[id] = clampSkill(skill);
      return { ...s, professions: { ...s.professions, secondary } };
    });
  },
  setNotes(notes: string) {
    setProgress((s) => ({ ...s, notes }));
  },
  /** Setzt den aktiven Charakter zurück (Name bleibt). */
  reset() {
    setProgress(() => createDefaultState());
  },

  // Charaktere
  addProfile(name: string, preset?: { faction: Faction; classId: ClassId; raceId: RaceId | null }): string | null {
    const app = getAppSnapshot();
    if (app.profiles.length >= MAX_PROFILES) return null;
    const state = createDefaultState();
    if (preset) state.settings = { ...state.settings, ...preset };
    const profile = createProfile(uniqueName(cleanName(name, `Charakter ${app.profiles.length + 1}`), app.profiles.map((p) => p.name)), state);
    setAppData({ ...app, activeId: profile.id, profiles: [...app.profiles, profile] });
    return profile.id;
  },
  switchProfile(id: string) {
    const app = getAppSnapshot();
    if (app.activeId === id || !app.profiles.some((p) => p.id === id)) return;
    setAppData({ ...app, activeId: id });
  },
  renameProfile(id: string, name: string) {
    const app = getAppSnapshot();
    setAppData({ ...app, profiles: app.profiles.map((p) => (p.id === id ? { ...p, name: cleanName(name, p.name) } : p)) });
  },
  /** Löscht einen Charakter; der letzte bleibt immer erhalten. */
  deleteProfile(id: string) {
    const app = getAppSnapshot();
    if (app.profiles.length <= 1) return;
    const profiles = app.profiles.filter((p) => p.id !== id);
    setAppData({ ...app, profiles, activeId: app.activeId === id ? profiles[0].id : app.activeId });
  },
  /** Fügt importierte Charaktere als neue hinzu (nichts wird überschrieben) und wechselt zum ersten. Gibt die Anzahl zurück. */
  importProfiles(imported: Profile[]): number {
    const app = getAppSnapshot();
    const room = Math.max(0, MAX_PROFILES - app.profiles.length);
    const taken = app.profiles.map((p) => p.name);
    const added = imported.slice(0, room).map((p) => {
      const name = uniqueName(p.name, taken);
      taken.push(name);
      return { ...p, name, id: createProfile("x").id };
    });
    if (added.length === 0) return 0;
    setAppData({ ...app, activeId: added[0].id, profiles: [...app.profiles, ...added] });
    return added.length;
  },
};

export type { Profile };
