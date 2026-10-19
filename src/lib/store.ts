"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_STATE,
  STORAGE_KEY,
  clampLevel,
  clampSkill,
  createDefaultState,
  parseProgress,
  type ProgressState,
  type SecondaryProfessionId,
} from "./progress";
import { PRIMARY_PROFESSION_LIMIT } from "@/data/professions";
import { raceById } from "@/data/races";
import type { ClassId, Faction, ProfessionId, RaceId } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();
let cache: ProgressState | null = null;

function readStorage(): ProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = parseProgress(JSON.parse(raw));
    return parsed.ok ? parsed.state : createDefaultState();
  } catch {
    return createDefaultState();
  }
}

function getSnapshot(): ProgressState {
  if (cache === null) cache = readStorage();
  return cache;
}

function getServerSnapshot(): ProgressState {
  return DEFAULT_STATE;
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
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

/** Speichert einen neuen Zustand dauerhaft (localStorage) und benachrichtigt alle Komponenten. */
export function setProgress(updater: (prev: ProgressState) => ProgressState) {
  const next = { ...updater(getSnapshot()), updatedAt: new Date().toISOString() };
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Speicher voll oder deaktiviert – Zustand bleibt für die Sitzung erhalten.
  }
  emit();
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
    setProgress((s) => ({ ...s, settings: { ...s.settings, level: clampLevel(level) } }));
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
  importState(state: ProgressState) {
    setProgress(() => state);
  },
  reset() {
    setProgress(() => createDefaultState());
  },
};
