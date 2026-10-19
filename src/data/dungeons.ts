import type { Dungeon } from "@/lib/types";
import { v } from "./verify";

const classicDungeon = v.classic("Levelbereich aus Classic Era. Forever passt Dungeon-XP an (Dungeonquests: Bonus-XP in der Beta halbiert, Kill-XP später ca. +20 %).", [
  "zockify-roadmap",
  "kotaku-beta-changes",
]);

export const dungeons: Dungeon[] = [
  // Neue Forever-Dungeons
  {
    id: "hall-of-thanes",
    name: "Hall of Thanes",
    zoneId: "dun-morogh",
    levelMin: 13,
    levelMax: 18,
    isNew: true,
    faction: "alliance",
    soloValue: "medium",
    valueNote: "Allianz-Gegenstück zum Flammenschlund, unter Eisenschmiede. Lohnt sich, wenn du ohnehin in Dun Morogh/Loch Modan bist.",
    verification: v.beta(["iv-dungeons-news", "iv-dungeons-overview"], "Levelbereich 13–18; seit Beta-Start testbar."),
  },
  {
    id: "ruins-of-lordaeron",
    name: "Ruins of Lordaeron",
    zoneId: "tirisfal",
    levelMin: 15,
    levelMax: 20,
    isNew: true,
    faction: "horde",
    soloValue: "medium",
    valueNote: "Verlassenen-Dungeon mit Verbindung zur Unterstadt. Sinnvoll für Untote, die im Silberwald leveln.",
    verification: v.beta(["iv-dungeons-news", "iv-dungeons-overview"], "Levelbereich 15–20."),
  },
  {
    id: "excavation-site",
    name: "Excavation Site: Wetlands",
    zoneId: "wetlands",
    levelMin: 24,
    levelMax: 29,
    isNew: true,
    faction: "both",
    soloValue: "high",
    valueNote: "Liegt direkt auf der Allianz-Route im Sumpfland. Quests u. a. aus Menethil, Rotkamm, Eschental, Arathi und Orgrimmar – auch für die Horde erreichbar.",
    verification: v.beta(["iv-dungeons-news", "outputlag-wetlands"],"BlizzCon: 24–29, Beta-Client teilweise 26–31. Seit 1. Okt. testbar."),
  },
  {
    id: "dalaran",
    name: "City of Dalaran",
    zoneId: "alterac",
    levelMin: 28,
    levelMax: 33,
    isNew: true,
    faction: "both",
    soloValue: "medium",
    valueNote: "Liegt nahe Süderstade/Tarrens Mühle – passt zum Abschluss des Vorgebirges.",
    verification: v.beta(["iv-dungeons-news", "iv-dungeons-overview"], "Meist 28–33 angegeben (Icy-Veins-Tabelle: 28–35). Seit Beta-Update 8. Okt. testbar."),
  },
  {
    id: "drowned-city",
    name: "The Drowned City",
    zoneId: "stranglethorn",
    levelMin: 35,
    levelMax: 40,
    isNew: true,
    faction: "both",
    soloValue: "medium",
    valueNote: "Trolle, Naga und Piraten vor der Küste des Schlingendorntals. Passt in die Schlingendorn-Phase.",
    verification: v.confirmed(["iv-dungeons-news"], "Auf der BlizzCon spielbar; Questdetails noch nicht dokumentiert."),
  },
  // Klassische Dungeons
  { id: "ragefire", name: "Flammenschlund", zoneId: "durotar", levelMin: 13, levelMax: 18, isNew: false, faction: "horde", soloValue: "low", valueNote: "Kurz, aber Quests verteilt in Orgrimmar. Nur mit schneller Gruppe.", verification: classicDungeon },
  { id: "deadmines", name: "Die Todesminen", zoneId: "westfall", levelMin: 17, levelMax: 26, isNew: false, faction: "both", soloValue: "high", valueNote: "Abschluss der Westfall-Kette (Defias-Bruderschaft) mit guten Belohnungen.", verification: classicDungeon },
  { id: "wailing-caverns", name: "Die Höhlen des Wehklagens", zoneId: "barrens", levelMin: 17, levelMax: 24, isNew: false, faction: "both", soloValue: "medium", valueNote: "Viele Quests aus dem Brachland, aber langer, verwirrender Dungeon.", verification: classicDungeon },
  { id: "shadowfang", name: "Burg Schattenfang", zoneId: "silverpine", levelMin: 22, levelMax: 30, isNew: false, faction: "both", soloValue: "medium", valueNote: "Für Horde gut mit Silberwald/Hügelland kombinierbar.", verification: classicDungeon },
  { id: "bfd", name: "Tiefschwarze Grotte", zoneId: "ashenvale", levelMin: 24, levelMax: 32, isNew: false, faction: "both", soloValue: "low", valueNote: "Wenig Questwert im Verhältnis zur Laufzeit.", verification: classicDungeon },
  { id: "stockade", name: "Das Verlies", zoneId: "elwynn", levelMin: 24, levelMax: 32, isNew: false, faction: "alliance", soloValue: "medium", valueNote: "Kurz, Quests aus Sturmwind/Rotkamm/Westfall.", verification: classicDungeon },
  { id: "gnomeregan", name: "Gnomeregan", zoneId: "dun-morogh", levelMin: 29, levelMax: 38, isNew: false, faction: "both", soloValue: "low", valueNote: "Lang und unübersichtlich – überspringen.", verification: classicDungeon },
  { id: "rfk", name: "Kral der Klingenhauer", zoneId: "barrens", levelMin: 29, levelMax: 38, isNew: false, faction: "both", soloValue: "low", valueNote: "Optional.", verification: classicDungeon },
  { id: "scarlet-monastery", name: "Scharlachrotes Kloster", zoneId: "tirisfal", levelMin: 30, levelMax: 45, isNew: false, faction: "both", soloValue: "high", valueNote: "Vier kurze Flügel, gute Waffen-Belohnungen. Ideal für 30–40.", verification: classicDungeon },
  { id: "rfd", name: "Hügel der Klingenhauer", zoneId: "barrens", levelMin: 37, levelMax: 46, isNew: false, faction: "both", soloValue: "low", valueNote: "In der Beta mit Level-30-Cap freigeschaltet; Questwert gering.", verification: classicDungeon },
  { id: "uldaman", name: "Uldaman", zoneId: "badlands", levelMin: 41, levelMax: 51, isNew: false, faction: "both", soloValue: "medium", valueNote: "Lange Questkette (v. a. Allianz) – nur, wenn du ohnehin im Ödland bist.", verification: classicDungeon },
  { id: "zulfarrak", name: "Zul'Farrak", zoneId: "tanaris", levelMin: 44, levelMax: 54, isNew: false, faction: "both", soloValue: "medium", valueNote: "Kompakt, mehrere Quests aus Tanaris.", verification: classicDungeon },
  { id: "maraudon", name: "Maraudon", zoneId: "desolace", levelMin: 46, levelMax: 55, isNew: false, faction: "both", soloValue: "medium", valueNote: "Lang, aber gute Belohnungen.", verification: classicDungeon },
  { id: "sunken-temple", name: "Versunkener Tempel", zoneId: "swamp-of-sorrows", levelMin: 50, levelMax: 56, isNew: false, faction: "both", soloValue: "low", valueNote: "Klassenquests ggf. relevant, sonst optional.", verification: classicDungeon },
  { id: "brd", name: "Schwarzfelstiefen", zoneId: "searing-gorge", levelMin: 52, levelMax: 60, isNew: false, faction: "both", soloValue: "medium", valueNote: "Viele Quests, aber sehr lang. Erst kurz vor 60 interessant.", verification: classicDungeon },
];

export const dungeonById = new Map(dungeons.map((d) => [d.id, d]));
