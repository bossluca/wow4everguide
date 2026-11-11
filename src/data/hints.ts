import type { ClassId, RaceId, Verification } from "@/lib/types";
import { dated, v } from "./verify";

export interface PhaseHint {
  levelMin: number;
  levelMax: number;
  classId?: ClassId;
  raceId?: RaceId;
  text: string;
  verification: Verification;
}

const general = v.provisional(["classic-reference"], "Allgemeiner Leveling-Hinweis.");

/** Kurze Hinweise je Levelphase. Klassenspezifische Hinweise mit classId. */
export const phaseHints: PhaseHint[] = [
  { levelMin: 1, levelMax: 10, text: "Erste Hilfe und Kochkunst sofort lernen – Verbände und Essen sparen viel Pausenzeit.", verification: general },
  { levelMin: 1, levelMax: 10, text: "Ruhestein immer im Hub des aktuellen Gebiets setzen.", verification: general },
  { levelMin: 10, levelMax: 20, text: "Gelbe und orange Quests bevorzugen, rote meiden. Graue Quests abbrechen statt hinterherlaufen.", verification: general },
  { levelMin: 10, levelMax: 30, text: "Dungeonquests geben in Forever weiterhin Bonus-XP, aber in der Beta nur noch halb so viel – Dungeons nur mitnehmen, wenn sie auf dem Weg liegen.", verification: v.beta(["kotaku-beta-changes", "zockify-roadmap"]) },
  { levelMin: 1, levelMax: 60, text: "Gekochtes Essen gibt in Forever einen kleinen XP-Bonus – Buff-Essen lohnt sich doppelt.", verification: v.beta(["zockify-professions", "wf-experience"]) },
  { levelMin: 1, levelMax: 60, text: "Erholung (Rested XP) gilt nur für Kills, nicht für Quests. Ausloggen im Gasthaus oder Lager lohnt sich.", verification: v.beta(["wf-experience"]) },
  { levelMin: 1, levelMax: 60, text: "Gegner regenerieren außerhalb des Kampfes wieder Leben (Beta-Fix 15. Okt.) – Kämpfe nicht abbrechen und später fortsetzen.", verification: v.beta(["iv-oct15", "blizz-devnotes"]) },
  { levelMin: 24, levelMax: 30, text: "Allianz: Die neue Fähre Menethil ↔ Süderstade ↔ Auberdine spart den Fußweg zwischen Sumpfland, Vorgebirge und Dunkelküste.", verification: v.beta(["gamesgg-wetlands"]) },
  { levelMin: 20, levelMax: 30, text: "Im Sumpfland die neuen Forever-Quests priorisieren – klassische Sumpfland-Lücken sind dadurch geschlossen.", verification: v.confirmed(["outputlag-wetlands"]) },
  { levelMin: 35, levelMax: 45, text: "Riverglades statt verstreuter 40er-Gebiete: eine Zone mit über 150 Quests spart Reisewege.", verification: v.confirmed(["wiki-forever"]) },
  { levelMin: 38, levelMax: 42, text: "Gold für das Reittier zurücklegen (Reiten klassisch ab 40). Teure Ausbildung erst danach planen.", verification: v.classic("Reittier-Stufe aus Classic, für Forever nicht bestätigt.") },
  // Klassen
  { levelMin: 10, levelMax: 19, classId: "druid", text: "Bis 20 in Bärengestalt kämpfen und mit Zaubern eröffnen; ab 20 in Katzengestalt wechseln.", verification: v.classic() },
  { levelMin: 20, levelMax: 29, classId: "druid", text: "Omen der Klarsicht ist ab 20 Grundfähigkeit – keinen Talentpunkt dafür einplanen.", verification: v.beta(["wfg-druid", "lfcarry-class-changes"]) },
  { levelMin: 30, levelMax: 32, classId: "druid", text: "Reisegestalt beim Trainer holen – größter Komfortgewinn der Levelphase.", verification: v.classic() },
  { levelMin: 1, levelMax: 19, classId: "paladin", text: "Bis Siegel des Befehls ist der Paladin langsam – Questwaffen-Upgrades haben Priorität.", verification: v.beta(["cc-paladin-leveling"]) },
  { levelMin: 20, levelMax: 40, classId: "paladin", text: "Siegel aktiv halten, Richturteil + Holy Strike auf Abklingzeit, Mana als Lebensreserve betrachten.", verification: v.beta(["iv-ret-paladin"]) },
  { levelMin: 1, levelMax: 19, classId: "priest", text: "Zauberstab ist dein wichtigstes Item – Upgrades im AH oder per Verzauberkunst.", verification: v.provisional(["zockify-priest"]) },
  { levelMin: 20, levelMax: 60, classId: "priest", text: "Schild → Schmerz → Gedankenschlag → Verschlingende Seuche (24 s) → Gedankenschinden. Mit Willensentzug ohne Pause weiterziehen.", verification: v.provisional(["zockify-priest", "mobalytics-priest", "lfcarry-patch-notes"]) },
  { levelMin: 1, levelMax: 30, classId: "priest", text: "Zauberstab braucht 0,5 s Stillstand vor dem Schuss – erst anhalten, dann feuern.", verification: v.beta(["iv-oct15"]) },
  { levelMin: 1, levelMax: 9, classId: "warlock", text: "Wichtel aus dem ersten Zauber rufen, Verderbnis ab 4 setzen – das Pet tankt, du bleibst in der Distanz.", verification: v.classic() },
  { levelMin: 10, levelMax: 19, classId: "warlock", text: "Leerwandler-Klassenquest beim Trainer in Sturmwind (Magierviertel) – ab dann hält das Pet auch mehrere Gegner.", verification: v.classic("Trainer-Standort aus Classic; im Spiel prüfen.") },
  { levelMin: 10, levelMax: 30, classId: "warlock", text: "Improved Corruption 5/5 macht Verderbnis sofort wirksam – laut Conquest Capped der wichtigste Punkt für zügiges Questen.", verification: dated(v.beta(["cc-warlock"], undefined, "Drittquelle, Stand Nov. 2026")) },
  { levelMin: 1, levelMax: 60, classId: "warlock", text: "Pet-Leben skaliert in Forever mit Ausdauer (7,5 → 2 pro Punkt, 3. Nov.) – Ausdauer ist für Pet und Aderlass weniger wichtig als früher.", verification: dated(v.provisional(["foreverchanges-warlock"], "Drittquelle, Stand 3. Nov. 2026.")) },
  { levelMin: 10, levelMax: 14, classId: "paladin", text: "Klassenquest Stufe 12 (Tome of Divinity) beim Trainer in Sturmwind erledigen – gibt Auferstehung.", verification: v.classic("Questname und Stufe aus Classic; im Spiel prüfen.") },
  { levelMin: 1, levelMax: 60, raceId: "human", text: "Mensch: Schwert-Spezialisierung gibt 2 % kritische Trefferchance statt Waffenskill (Beta) – für den Paladin lohnt eine Schwertwaffe.", verification: dated(v.beta(["wt-human", "iv-human", "method-racials"], "Racial-Umbau vom 15. Okt.; Werte können sich bis zum Release geändert haben.", "Beta 1.60.1.70425 (15. Okt. 2026)")) },
  { levelMin: 1, levelMax: 60, raceId: "human", text: "Mensch: Wille zum Überleben entfernt Betäubungen (3 min), Wahrnehmung erkennt Verstohlene (20 s).", verification: dated(v.beta(["wt-human", "iv-human"], "Wahrnehmung unverändert, Wille zum Überleben neu.", "Beta 1.60.1.70425 (15. Okt. 2026)")) },
];

export function hintsFor(level: number, classId: ClassId, raceId: RaceId | null = null): PhaseHint[] {
  return phaseHints.filter(
    (h) =>
      level >= h.levelMin &&
      level <= h.levelMax &&
      (!h.classId || h.classId === classId) &&
      (!h.raceId || h.raceId === raceId),
  );
}
