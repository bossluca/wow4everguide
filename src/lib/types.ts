/**
 * Typisierte Datenmodelle für den WoW-Forever-Leveling-Companion.
 * Inhalte liegen in src/data, die Darstellung in src/components.
 */

export type Faction = "alliance" | "horde";
export type ZoneFaction = Faction | "contested" | "neutral";

/** Verifikationsstatus laut Auftrag. */
export type VerificationStatus =
  | "confirmed" // Bestätigt: offizielle Infos oder belastbare aktuelle Spieldaten
  | "beta" // Beta-getestet: in einer konkreten Beta-Version überprüft
  | "classic" // Klassische Referenz: aus Classic übernommen, nicht für Forever verifiziert
  | "provisional"; // Vorläufig: plausible Empfehlung, muss noch geprüft werden

export interface Verification {
  status: VerificationStatus;
  /** IDs aus src/data/sources.ts */
  sourceIds: string[];
  /** z. B. "Beta 1.60.1.70425" oder "BlizzCon 2026" */
  version?: string;
  /** ISO-Datum der letzten Prüfung */
  checkedAt: string;
  note?: string;
}

export type SourceKind = "official" | "guide" | "datamine" | "community" | "classic-reference";

export interface Source {
  id: string;
  title: string;
  url: string;
  publisher: string;
  kind: SourceKind;
  topics: string[];
  checkedAt: string;
  /** Wie wurde die Quelle geprüft? z. B. Suchauszug statt Volltext */
  accessNote?: string;
}

export type ForeverZoneStatus = "new" | "revamped" | "changed" | "classic";
export type Continent = "eastern-kingdoms" | "kalimdor" | "islands";

export interface Zone {
  id: string;
  name: string;
  continent: Continent;
  levelMin: number;
  levelMax: number;
  faction: ZoneFaction;
  foreverStatus: ForeverZoneStatus;
  /** Ressourcen-IDs aus src/data/resources.ts */
  resourceIds: string[];
  /** Kürschnerbare Gegner: grober Levelbereich der Wildtiere */
  skinnableLevels?: [number, number];
  flightPaths: { alliance: string[]; horde: string[] };
  notes?: string[];
  verification: Verification;
}

export type QuestKind = "quest" | "chain" | "dungeon" | "elite" | "class";

export interface Quest {
  id: string;
  name: string;
  zoneId: string;
  level?: number;
  kind: QuestKind;
  faction: Faction | "both";
  note?: string;
  verification: Verification;
}

export interface Dungeon {
  id: string;
  name: string;
  zoneId: string;
  levelMin: number;
  levelMax: number;
  isNew: boolean;
  faction: Faction | "both";
  /** Lohnt sich der Dungeon für entspanntes Solo-Leveling (via Gruppensuche)? */
  soloValue: "high" | "medium" | "low";
  valueNote: string;
  verification: Verification;
}

export type StepKind =
  | "quest"
  | "travel"
  | "train"
  | "profession"
  | "dungeon"
  | "hub"
  | "hearth"
  | "note";

export interface RouteStep {
  id: string;
  kind: StepKind;
  text: string;
  /** Wichtig = Hauptroute, sollte gemacht werden */
  important?: boolean;
  /** Optional = lohnt sich nur unter Umständen */
  optional?: boolean;
  questIds?: string[];
  /** Nur für bestimmte Klassen relevant */
  classIds?: ClassId[];
}

export interface RouteSection {
  id: string;
  faction: Faction;
  order: number;
  levelMin: number;
  levelMax: number;
  zoneId: string;
  title: string;
  /** Nur für bestimmte Startvölker (z. B. Startgebiete) */
  startRaces?: RaceId[];
  summary: string;
  hubs: string[];
  steps: RouteStep[];
  keyQuestIds: string[];
  optionalDungeonIds: string[];
  travel: string[];
  trainers: string[];
  professionNotes: string[];
  warnings: string[];
  leaveWhen: string[];
  /** Ehrlich dokumentierte Datenlücken dieses Abschnitts */
  gaps?: string[];
  verification: Verification;
}

export type ClassId = "paladin" | "priest" | "druid";
export type RaceId =
  | "human"
  | "dwarf"
  | "nightelf"
  | "gnome"
  | "skyborne-alliance"
  | "undead"
  | "troll"
  | "tauren"
  | "orc"
  | "skyborne-horde";

export interface Race {
  id: RaceId;
  name: string;
  faction: Faction;
  startZoneId: string;
  classes: ClassId[];
  note?: string;
}

export type Rating = "sehr gut" | "gut" | "mittel" | "schwach";

export interface ClassCriterion {
  id: string;
  label: string;
}

export interface ClassRating {
  criterionId: string;
  rating: Rating;
  text: string;
}

export interface TalentMilestone {
  levels: string;
  focus: string;
  details: string[];
  verification: Verification;
}

export interface Ability {
  name: string;
  level?: number;
  note: string;
  foreverChange?: boolean;
  verification: Verification;
}

export interface ClassGuide {
  id: ClassId;
  name: string;
  summary: string;
  roles: string[];
  ratings: ClassRating[];
  soloSpec: { name: string; why: string };
  talentMilestones: TalentMilestone[];
  abilities: Ability[];
  rotation: string[];
  resourceTips: string[];
  hardEnemyTips: string[];
  gearPriorities: string[];
  alternative?: { name: string; when: string };
  foreverChanges: { text: string; verification: Verification }[];
  verification: Verification;
}

export type ProfessionId =
  | "herbalism"
  | "mining"
  | "skinning"
  | "alchemy"
  | "blacksmithing"
  | "leatherworking"
  | "tailoring"
  | "engineering"
  | "enchanting"
  | "cooking"
  | "fishing"
  | "firstaid";

export type ProfessionKind = "gathering" | "crafting" | "secondary";

export interface Profession {
  id: ProfessionId;
  name: string;
  kind: ProfessionKind;
  summary: string;
  levelingValue: string;
  goldValue: string;
  foreverChanges: { text: string; verification: Verification }[];
  campObject?: string;
  verification: Verification;
}

export interface Resource {
  id: string;
  name: string;
  professionId: "herbalism" | "mining" | "skinning";
  skill: number;
  usedBy: ProfessionId[];
  /** Grobe Einschätzung, keine Marktpreise */
  demand: "hoch" | "mittel" | "niedrig";
  note?: string;
  verification: Verification;
}

export interface Recipe {
  id: string;
  name: string;
  professionId: ProfessionId;
  skill: number;
  reagents: string;
  purpose: "eigennutzen" | "verkauf" | "skillen";
  note: string;
  verification: Verification;
}

export type ComboGoal = "gold" | "wege" | "kosten" | "eigennutzen" | "level60";

export interface ProfessionCombo {
  id: string;
  professions: [ProfessionId, ProfessionId];
  title: string;
  verdict: string;
  scores: Record<ComboGoal, Rating>;
  pros: string[];
  cons: string[];
  bestFor: ClassId[];
  verification: Verification;
}

export interface GoldPlanBracket {
  id: string;
  levelMin: number;
  levelMax: number;
  gather: string[];
  sell: string[];
  keep: string[];
  craft: string[];
  trainer: string[];
  fits: string[];
  verification: Verification;
}

export interface DataGap {
  id: string;
  area: string;
  text: string;
  impact: "hoch" | "mittel" | "niedrig";
}
