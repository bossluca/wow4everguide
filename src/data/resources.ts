import type { Resource } from "@/lib/types";
import { v } from "./verify";

const c = v.classic("Skillstufe aus Classic Era; Forever ändert laut Beta-Guides die Sammel-Skillstufen kaum.", [
  "zockify-professions",
]);

/**
 * Sammelressourcen. Skillstufen = Classic-Referenz. Nachfrage ist eine allgemeine
 * Einschätzung – keine Auktionshauspreise.
 */
export const resources: Resource[] = [
  // Kräuterkunde
  { id: "peacebloom", name: "Friedensblume", professionId: "herbalism", skill: 1, usedBy: ["alchemy", "firstaid"], demand: "niedrig", verification: c },
  { id: "silverleaf", name: "Silberblatt", professionId: "herbalism", skill: 1, usedBy: ["alchemy", "firstaid"], demand: "niedrig", verification: c },
  { id: "earthroot", name: "Erdwurzel", professionId: "herbalism", skill: 15, usedBy: ["alchemy"], demand: "niedrig", verification: c },
  { id: "mageroyal", name: "Maguskönigskraut", professionId: "herbalism", skill: 50, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "briarthorn", name: "Wilddornrose", professionId: "herbalism", skill: 70, usedBy: ["alchemy", "firstaid"], demand: "mittel", note: "In Classic Basis für Heiltränke – in Forever laut Beta evtl. relevant für Erste Hilfe.", verification: c },
  { id: "stranglekelp", name: "Würgetang", professionId: "herbalism", skill: 85, usedBy: ["alchemy"], demand: "niedrig", verification: c },
  { id: "bruiseweed", name: "Beulengras", professionId: "herbalism", skill: 100, usedBy: ["alchemy", "firstaid"], demand: "mittel", verification: c },
  { id: "wild-steelbloom", name: "Wildstahlblume", professionId: "herbalism", skill: 115, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "grave-moss", name: "Grabmoos", professionId: "herbalism", skill: 120, usedBy: ["alchemy"], demand: "niedrig", verification: c },
  { id: "kingsblood", name: "Königsblut", professionId: "herbalism", skill: 125, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "liferoot", name: "Lebenswurz", professionId: "herbalism", skill: 150, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "fadeleaf", name: "Blassblatt", professionId: "herbalism", skill: 160, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "goldthorn", name: "Golddorn", professionId: "herbalism", skill: 170, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "khadgars-whisker", name: "Khadgars Schnurrbart", professionId: "herbalism", skill: 185, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "firebloom", name: "Feuerblüte", professionId: "herbalism", skill: 205, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "purple-lotus", name: "Lila Lotus", professionId: "herbalism", skill: 210, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "sungrass", name: "Sonnengras", professionId: "herbalism", skill: 230, usedBy: ["alchemy"], demand: "hoch", note: "Klassisch gefragt für Elixiere.", verification: c },
  { id: "blindweed", name: "Blindkraut", professionId: "herbalism", skill: 235, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "ghost-mushroom", name: "Geisterpilz", professionId: "herbalism", skill: 245, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "gromsblood", name: "Gromsblut", professionId: "herbalism", skill: 250, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "golden-sansam", name: "Goldener Sansam", professionId: "herbalism", skill: 260, usedBy: ["alchemy"], demand: "hoch", verification: c },
  { id: "dreamfoil", name: "Traumblatt", professionId: "herbalism", skill: 270, usedBy: ["alchemy"], demand: "hoch", note: "Klassisch Grundlage für Fläschchen/Manatränke auf 60.", verification: c },
  { id: "mountain-silversage", name: "Bergsilbersalbei", professionId: "herbalism", skill: 280, usedBy: ["alchemy"], demand: "hoch", verification: c },
  { id: "plaguebloom", name: "Pestblüte", professionId: "herbalism", skill: 285, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "icecap", name: "Eiskappe", professionId: "herbalism", skill: 290, usedBy: ["alchemy"], demand: "mittel", verification: c },
  { id: "black-lotus", name: "Schwarzer Lotus", professionId: "herbalism", skill: 300, usedBy: ["alchemy"], demand: "hoch", note: "Selten – nicht gezielt farmen, nur mitnehmen.", verification: c },
  // Bergbau
  { id: "copper", name: "Kupfervorkommen", professionId: "mining", skill: 1, usedBy: ["blacksmithing", "engineering"], demand: "mittel", verification: c },
  { id: "tin", name: "Zinnvorkommen", professionId: "mining", skill: 65, usedBy: ["blacksmithing", "engineering"], demand: "mittel", verification: c },
  { id: "silver", name: "Silbervorkommen", professionId: "mining", skill: 75, usedBy: ["blacksmithing", "engineering"], demand: "niedrig", verification: c },
  { id: "iron", name: "Eisenvorkommen", professionId: "mining", skill: 125, usedBy: ["blacksmithing", "engineering"], demand: "hoch", note: "Klassisch stark nachgefragt zum Skillen.", verification: c },
  { id: "gold", name: "Goldader", professionId: "mining", skill: 155, usedBy: ["blacksmithing", "engineering"], demand: "mittel", verification: c },
  { id: "mithril", name: "Mithrilablagerung", professionId: "mining", skill: 175, usedBy: ["blacksmithing", "engineering"], demand: "hoch", verification: c },
  { id: "truesilver", name: "Echtsilberablagerung", professionId: "mining", skill: 230, usedBy: ["blacksmithing"], demand: "mittel", verification: c },
  { id: "small-thorium", name: "Kleine Thoriumader", professionId: "mining", skill: 245, usedBy: ["blacksmithing", "engineering"], demand: "hoch", verification: c },
  { id: "rich-thorium", name: "Reiche Thoriumader", professionId: "mining", skill: 275, usedBy: ["blacksmithing", "engineering"], demand: "hoch", verification: c },
  {
    id: "azerothium",
    name: "Azerothium (neu)",
    professionId: "mining",
    skill: 0,
    usedBy: ["blacksmithing"],
    demand: "mittel",
    note: "Neues Forever-Erz/-Barren („Smelt Azerothium“). Fundorte und Skillstufe noch nicht belastbar dokumentiert.",
    verification: v.beta(["zockify-professions"], "Rezept 'Smelt Azerothium' aus Beta-Datenauszügen; Fundorte unbekannt."),
  },
  // Kürschnerei (Skillbedarf hängt vom Gegnerlevel ab)
  { id: "light-leather", name: "Leichtes Leder", professionId: "skinning", skill: 1, usedBy: ["leatherworking"], demand: "mittel", note: "Wildtiere ca. Stufe 1–20.", verification: c },
  { id: "medium-leather", name: "Mittleres Leder", professionId: "skinning", skill: 100, usedBy: ["leatherworking"], demand: "mittel", note: "Wildtiere ca. Stufe 20–30.", verification: c },
  { id: "heavy-leather", name: "Schweres Leder", professionId: "skinning", skill: 150, usedBy: ["leatherworking"], demand: "mittel", note: "Wildtiere ca. Stufe 30–40.", verification: c },
  { id: "thick-leather", name: "Dickes Leder", professionId: "skinning", skill: 200, usedBy: ["leatherworking"], demand: "hoch", note: "Wildtiere ca. Stufe 40–50.", verification: c },
  { id: "rugged-leather", name: "Unverwüstliches Leder", professionId: "skinning", skill: 250, usedBy: ["leatherworking"], demand: "hoch", note: "Wildtiere ca. Stufe 50–60.", verification: c },
];

export const resourceById = new Map(resources.map((r) => [r.id, r]));

/**
 * Benötigter Kürschnerei-Skill für ein Gegnerlevel (Classic-Formel).
 * Bis Stufe 10: 1, 11–20: (Stufe − 10) × 10, ab 21: Stufe × 5.
 */
export function skinningSkillForLevel(level: number): number {
  if (level <= 10) return 1;
  if (level <= 20) return (level - 10) * 10;
  return level * 5;
}
