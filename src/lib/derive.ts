import type { ClassId, Faction, RaceId, Resource, RouteSection, RouteStep } from "./types";
import type { ProgressState } from "./progress";
import { routes } from "@/data/route";
import { zoneById } from "@/data/zones";
import { resourceById, skinningSkillForLevel } from "@/data/resources";
import { raceById } from "@/data/races";

/** Gilt eine Station für die gewählte Klasse? */
export function stepAppliesToClass(step: RouteStep, classId: ClassId): boolean {
  return !step.classIds || step.classIds.includes(classId);
}

/**
 * Abschnitte der gewählten Fraktion, gefiltert nach Startvolk. Ohne gewähltes Volk werden
 * nur Startzweige gezeigt, deren Völker die gewählte Klasse spielen können.
 */
export function sectionsForPlayer(faction: Faction, raceId: RaceId | null, classId?: ClassId): RouteSection[] {
  return routes[faction].filter((s) => {
    if (!s.startRaces) return true;
    if (raceId) return s.startRaces.includes(raceId);
    if (!classId) return true;
    return s.startRaces.some((r) => raceById.get(r)?.classes.includes(classId));
  });
}

export function stepsForClass(section: RouteSection, classId: ClassId): RouteStep[] {
  return section.steps.filter((st) => stepAppliesToClass(st, classId));
}

export interface SectionProgress {
  done: number;
  total: number;
  importantDone: number;
  importantTotal: number;
  percent: number;
  complete: boolean;
}

export function sectionProgress(
  section: RouteSection,
  completed: ProgressState["completedSteps"],
  classId: ClassId,
): SectionProgress {
  const steps = stepsForClass(section, classId);
  const done = steps.filter((s) => s.id in completed).length;
  const important = steps.filter((s) => s.important);
  const importantDone = important.filter((s) => s.id in completed).length;
  return {
    done,
    total: steps.length,
    importantDone,
    importantTotal: important.length,
    percent: steps.length ? Math.round((done / steps.length) * 100) : 0,
    complete: important.length > 0 ? importantDone === important.length : done === steps.length,
  };
}

/**
 * Aktueller Abschnitt: bevorzugt das gewählte Gebiet, sonst der erste Abschnitt,
 * dessen Levelbereich noch nicht überschritten ist und dessen wichtige Stationen offen sind.
 */
export function currentSection(state: ProgressState): RouteSection | undefined {
  const { faction, raceId, level, currentZoneId, classId } = state.settings;
  const list = sectionsForPlayer(faction, raceId, classId);
  if (currentZoneId) {
    const inZone = list.filter((s) => s.zoneId === currentZoneId);
    const open = inZone.find((s) => !sectionProgress(s, state.completedSteps, classId).complete);
    if (open ?? inZone[0]) return open ?? inZone[0];
  }
  const candidate = list.find(
    (s) => level <= s.levelMax && !sectionProgress(s, state.completedSteps, classId).complete,
  );
  return candidate ?? list.find((s) => level <= s.levelMax) ?? list[list.length - 1];
}

/** Empfohlener Folgeabschnitt nach dem aktuellen (gleiche Startvolk-Logik). */
export function nextSection(state: ProgressState, current?: RouteSection): RouteSection | undefined {
  const list = sectionsForPlayer(state.settings.faction, state.settings.raceId, state.settings.classId);
  const cur = current ?? currentSection(state);
  if (!cur) return undefined;
  const idx = list.findIndex((s) => s.id === cur.id);
  // Parallele Zweige (andere Startvölker) überspringen: Der Folgeabschnitt muss höher reichen
  // und denselben Zweig fortsetzen (gemeinsames Startvolk oder für alle Völker).
  return list.slice(idx + 1).find((s) => {
    if (s.levelMax <= cur.levelMax) return false;
    if (!cur.startRaces || !s.startRaces) return true;
    return s.startRaces.some((r) => cur.startRaces!.includes(r));
  });
}

export interface OpenTask {
  section: RouteSection;
  step: RouteStep;
}

export function nextTasks(state: ProgressState, limit = 5): OpenTask[] {
  const cur = currentSection(state);
  if (!cur) return [];
  const sections = [cur, nextSection(state, cur)].filter(Boolean) as RouteSection[];
  const tasks: OpenTask[] = [];
  for (const section of sections) {
    for (const step of stepsForClass(section, state.settings.classId)) {
      if (!(step.id in state.completedSteps)) tasks.push({ section, step });
      if (tasks.length >= limit) return tasks;
    }
  }
  return tasks;
}

export interface RouteTotals {
  done: number;
  total: number;
  percent: number;
}

export function routeTotals(state: ProgressState): RouteTotals {
  const list = sectionsForPlayer(state.settings.faction, state.settings.raceId, state.settings.classId);
  let done = 0;
  let total = 0;
  for (const s of list) {
    const p = sectionProgress(s, state.completedSteps, state.settings.classId);
    done += p.done;
    total += p.total;
  }
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** Levelfortschritt bis 60 (Stufe 1 = 0 %, Stufe 60 = 100 %). */
export function levelPercent(level: number): number {
  return Math.round(((Math.min(60, Math.max(1, level)) - 1) / 59) * 100);
}

export interface ZoneProgress {
  zoneId: string;
  done: number;
  total: number;
  percent: number;
}

export function zoneProgressList(state: ProgressState): ZoneProgress[] {
  const map = new Map<string, ZoneProgress>();
  for (const s of sectionsForPlayer(state.settings.faction, state.settings.raceId, state.settings.classId)) {
    const p = sectionProgress(s, state.completedSteps, state.settings.classId);
    const entry = map.get(s.zoneId) ?? { zoneId: s.zoneId, done: 0, total: 0, percent: 0 };
    entry.done += p.done;
    entry.total += p.total;
    entry.percent = entry.total ? Math.round((entry.done / entry.total) * 100) : 0;
    map.set(s.zoneId, entry);
  }
  return [...map.values()];
}

export type GatherAdvice = "sammelbar" | "bald" | "zu-niedrig" | "kein-beruf";

export interface ZoneResource {
  resource: Resource;
  advice: GatherAdvice;
  detour: boolean;
  skill?: number;
}

/**
 * Ressourcen eines Gebiets mit Bewertung für die eigenen Sammelberufe.
 * „detour“ = kleiner Umweg lohnt (sammelbar + hohe Nachfrage oder Skillpunkte).
 */
export function resourcesForZone(zoneId: string, state: ProgressState): ZoneResource[] {
  const zone = zoneById.get(zoneId);
  if (!zone) return [];
  const skills = new Map(state.professions.primary.map((p) => [p.id, p.skill]));
  const list: ZoneResource[] = [];
  for (const id of zone.resourceIds) {
    const resource = resourceById.get(id);
    if (!resource) continue;
    const skill = skills.get(resource.professionId);
    let advice: GatherAdvice = "kein-beruf";
    if (skill !== undefined) {
      if (skill >= resource.skill) advice = "sammelbar";
      else if (skill + 25 >= resource.skill) advice = "bald";
      else advice = "zu-niedrig";
    }
    // Ressourcen knapp über dem eigenen Skill geben noch Skillpunkte → lohnt ebenfalls.
    const givesSkill = skill !== undefined && skill >= resource.skill && skill < resource.skill + 50;
    const detour = advice === "sammelbar" && (resource.demand === "hoch" || givesSkill);
    list.push({ resource, advice, detour, skill });
  }
  return list;
}

/** Benötigter Kürschnerei-Skill für die Wildtiere eines Gebiets. */
export function skinningRangeForZone(zoneId: string): [number, number] | undefined {
  const zone = zoneById.get(zoneId);
  if (!zone?.skinnableLevels) return undefined;
  return [skinningSkillForLevel(zone.skinnableLevels[0]), skinningSkillForLevel(zone.skinnableLevels[1])];
}
