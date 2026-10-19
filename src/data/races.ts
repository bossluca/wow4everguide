import type { Race } from "@/lib/types";

/**
 * Nur Völker, die Paladin, Priester oder Druide spielen können.
 * Forever: Untoter Paladin und Gnom-Priester sind neue Kombinationen;
 * Skyborne (Paket nötig) können nur Druide aus dieser Auswahl spielen.
 * Quellen: iv-race-guide, blizz-skyborne (Verifikation siehe classes.ts).
 */
export const races: Race[] = [
  { id: "human", name: "Mensch", faction: "alliance", startZoneId: "elwynn", classes: ["paladin", "priest"] },
  { id: "dwarf", name: "Zwerg", faction: "alliance", startZoneId: "dun-morogh", classes: ["paladin", "priest"] },
  { id: "gnome", name: "Gnom", faction: "alliance", startZoneId: "dun-morogh", classes: ["priest"], note: "Gnom-Priester ist neu in Forever." },
  { id: "nightelf", name: "Nachtelf", faction: "alliance", startZoneId: "teldrassil", classes: ["priest", "druid"] },
  { id: "skyborne-alliance", name: "Skyborne (High Order)", faction: "alliance", startZoneId: "zephras-isle", classes: ["druid"], note: "Benötigt Skyborne-Paket; Start auf Zephras Isle (1–12)." },
  { id: "undead", name: "Untoter", faction: "horde", startZoneId: "tirisfal", classes: ["paladin", "priest"], note: "Untoter Paladin ist neu in Forever – einzige Horde-Paladin-Option." },
  { id: "troll", name: "Troll", faction: "horde", startZoneId: "durotar", classes: ["priest"] },
  { id: "tauren", name: "Tauren", faction: "horde", startZoneId: "mulgore", classes: ["druid"] },
  { id: "skyborne-horde", name: "Skyborne (Windshaper)", faction: "horde", startZoneId: "zephras-isle", classes: ["druid"], note: "Benötigt Skyborne-Paket; Start auf Zephras Isle (1–12)." },
];

export const raceById = new Map(races.map((r) => [r.id, r]));
