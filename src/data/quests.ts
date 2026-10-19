import type { Faction, Quest, QuestKind } from "@/lib/types";
import { v } from "./verify";

/**
 * Wichtige Quests und Questketten. Questnamen stehen im englischen Original, damit sie
 * sich direkt auf Wowhead suchen lassen. Alle Einträge sind Classic-Referenzen, solange
 * sie nicht ausdrücklich als Forever-Inhalt markiert sind.
 */
const classicQuest = v.classic("Classic-Quest; Existenz und Ablauf in Forever nicht einzeln geprüft.");

function q(
  id: string,
  name: string,
  zoneId: string,
  kind: QuestKind,
  faction: Faction | "both",
  level?: number,
  note?: string,
): Quest {
  return { id, name, zoneId, kind, faction, level, note, verification: classicQuest };
}

export const quests: Quest[] = [
  // Allianz-Startgebiete
  q("elw-kobold", "Kobold Camp Cleanup", "elwynn", "quest", "alliance", 2),
  q("elw-goldshire", "Report to Goldshire", "elwynn", "quest", "alliance", 5),
  q("elw-princess", "Princess Must Die!", "elwynn", "elite", "alliance", 9, "Gruppe empfohlen oder mit Stufe 10+ angehen."),
  q("dm-troll-cave", "The Troll Cave", "dun-morogh", "quest", "alliance", 6),
  q("dm-grizzled", "The Grizzled Den", "dun-morogh", "quest", "alliance", 7),
  q("dm-senir", "Senir's Observations", "dun-morogh", "chain", "alliance", 8),
  q("tel-balance", "The Balance of Nature", "teldrassil", "chain", "alliance", 2),
  q("tel-webwood", "Webwood Venom", "teldrassil", "quest", "alliance", 4),
  q("tel-relics", "The Relics of Wakening", "teldrassil", "quest", "alliance", 8),
  // Westfall / Loch Modan / Dunkelküste
  q("wf-defias", "The Defias Brotherhood", "westfall", "chain", "alliance", 14, "Lange Kette, endet in den Todesminen."),
  q("wf-stew", "Westfall Stew", "westfall", "quest", "alliance", 12, "Zutaten nebenbei mitnehmen."),
  q("wf-killing-fields", "The Killing Fields", "westfall", "quest", "alliance", 12),
  q("wf-patrol", "Patrolling Westfall", "westfall", "quest", "alliance", 14),
  q("wf-bandanas", "Red Leather Bandanas", "westfall", "quest", "alliance", 15),
  q("lm-sausages", "Thelsamar Blood Sausages", "loch-modan", "quest", "alliance", 12),
  q("lm-ironband", "Ironband's Excavation", "loch-modan", "chain", "alliance", 14),
  q("lm-filthy-paws", "Filthy Paws", "loch-modan", "quest", "alliance", 15),
  q("ds-prospector", "The Absent Minded Prospector", "darkshore", "chain", "alliance", 15, "Eskorte – langsam, aber gute XP."),
  q("ds-buzzbox", "Buzzbox 827", "darkshore", "chain", "alliance", 13),
  q("ds-washed-ashore", "Washed Ashore", "darkshore", "quest", "alliance", 13),
  q("ds-althalaxx", "The Tower of Althalaxx", "darkshore", "chain", "alliance", 14, "Führt später ins Eschental."),
  // Rotkamm / Dämmerwald / Eschental (Allianz)
  q("rr-blackrock", "Blackrock Menace", "redridge", "quest", "alliance", 20),
  q("rr-scales", "Underbelly Scales", "redridge", "quest", "alliance", 18),
  q("rr-shoes", "The Price of Shoes", "redridge", "quest", "alliance", 16),
  q("rr-solomon", "Solomon's Law", "redridge", "chain", "alliance", 22),
  q("rr-morganth", "Shadow Magic", "redridge", "elite", "alliance", 25, "Abschluss gegen Morganth – nur mit Gruppe oder überlevelt."),
  q("dw-night-watch", "The Night Watch", "duskwood", "chain", "alliance", 24),
  q("dw-stars", "Look to the Stars", "duskwood", "chain", "alliance", 24),
  q("dw-worgen", "Worgen in the Woods", "duskwood", "chain", "alliance", 25),
  q("dw-morbent", "Morbent Fel", "duskwood", "chain", "alliance", 32, "Endet gegen Morbent Fel – Zeitpunkt ca. 28–30 und gut vorbereitet."),
  q("av-bathran", "Bathran's Hair", "ashenvale", "quest", "alliance", 20),
  q("av-raene", "Raene's Cleansing", "ashenvale", "chain", "alliance", 22),
  q("av-althalaxx", "The Tower of Althalaxx (Eschental)", "ashenvale", "chain", "alliance", 24),
  // Sumpfland (klassischer Bestand; Forever ergänzt 25+ neue Quests)
  q("wl-croc", "Young Crocolisk Skins", "wetlands", "quest", "alliance", 21),
  q("wl-excavation-team", "In Search of The Excavation Team", "wetlands", "chain", "alliance", 25),
  q("wl-dirt", "Digging Through the Dirt", "wetlands", "quest", "alliance", 25),
  q("wl-thandol", "The Thandol Span", "wetlands", "chain", "alliance", 30, "Führt ins Arathihochland."),
  // Hügelland / Arathi / Schlingendorn (beide)
  q("hb-crushridge", "Crushridge Bounty", "hillsbrad", "quest", "alliance", 32),
  q("hb-syndicate", "Syndicate Assassins", "hillsbrad", "quest", "alliance", 29),
  q("hb-down-coast", "Down the Coast", "hillsbrad", "quest", "alliance", 26),
  q("hb-battle", "The Battle of Hillsbrad", "hillsbrad", "chain", "horde", 26),
  q("hb-elixir", "Elixir of Suffering", "hillsbrad", "quest", "horde", 24),
  q("ah-plague", "Hints of a New Plague?", "arathi", "chain", "alliance", 34),
  q("ah-gold", "Worth Its Weight in Gold", "arathi", "quest", "alliance", 32),
  q("ah-foul-magics", "Foul Magics", "arathi", "quest", "horde", 32),
  q("ah-hammer", "The Hammer May Fall", "arathi", "quest", "horde", 33),
  q("stv-nesingwary", "Nesingwary-Jagdreihe (Raptor/Tiger/Panther Mastery)", "stranglethorn", "chain", "both", 34, "Sehr effizient, viele Kills in einem Gebiet."),
  q("stv-green-hills", "The Green Hills of Stranglethorn", "stranglethorn", "chain", "both", 40, "Seiten nicht farmen – nur sammeln, was droppt; Rest im AH verkaufen."),
  q("stv-bloodsail", "Bloodsail Buccaneers", "stranglethorn", "chain", "both", 36),
  q("stv-zanzil", "Zanzil's Secret", "stranglethorn", "quest", "both", 39),
  // Desolace / Tausend Nadeln
  q("des-kodo", "Kodo Roundup", "desolace", "quest", "both", 34),
  q("des-centaur-bounty", "Centaur Bounty", "desolace", "quest", "horde", 36),
  q("des-ghost", "Ghost-o-plasm Round Up", "desolace", "quest", "both", 36),
  q("tn-rocket", "Rocket Car Parts", "thousand-needles", "quest", "both", 30),
  q("tn-free", "Free at Last", "thousand-needles", "quest", "horde", 29),
  // Horde-Startgebiete und 10–30
  q("dur-sarkoth", "Sarkoth", "durotar", "quest", "horde", 4),
  q("dur-familiars", "Vile Familiars", "durotar", "quest", "horde", 3),
  q("mul-hunt", "The Hunt Begins", "mulgore", "chain", "horde", 2),
  q("mul-strength", "Rite of Strength", "mulgore", "chain", "horde", 4),
  q("tir-mindless", "The Mindless Ones", "tirisfal", "chain", "horde", 3),
  q("tir-scarlet", "Scarlet Crusade", "tirisfal", "quest", "horde", 9),
  q("bar-plainstrider", "Plainstrider Menace", "barrens", "quest", "horde", 12),
  q("bar-raptor", "Raptor Thieves", "barrens", "quest", "horde", 13),
  q("bar-disrupt", "Disrupt the Attacks", "barrens", "quest", "horde", 13),
  q("bar-samophlange", "Samophlange", "barrens", "chain", "horde", 15),
  q("bar-forgotten-pools", "The Forgotten Pools", "barrens", "quest", "horde", 15),
  q("bar-counterattack", "Counterattack!", "barrens", "elite", "horde", 20, "Kriegsherr Krom'zar – Gruppe empfohlen."),
  q("sp-dead-fields", "The Dead Fields", "silverpine", "chain", "horde", 12),
  q("sp-weaver", "The Weaver", "silverpine", "quest", "horde", 15),
  q("sp-arugal", "Arugal Must Die", "silverpine", "dungeon", "horde", 27, "Burg Schattenfang."),
  q("st-reaper", "Super Reaper 6000", "stonetalon", "quest", "horde", 21),
  q("st-goblin", "Goblin Invaders", "stonetalon", "chain", "horde", 20),
  q("ash-hunt", "The Ashenvale Hunt", "ashenvale", "quest", "horde", 21),
  q("ash-warsong", "Warsong Supplies", "ashenvale", "quest", "horde", 23),
  // 40–50
  q("tan-water", "Water Pouch Bounty", "tanaris", "quest", "both", 45),
  q("tan-wastewander", "Wastewander Justice", "tanaris", "quest", "both", 45),
  q("tan-pirate", "Pirate Hats Ahoy!", "tanaris", "quest", "both", 46),
  q("tan-thistleshrub", "Thistleshrub Valley", "tanaris", "quest", "both", 49),
  q("fer-mark", "The Mark of Quality", "feralas", "quest", "both", 45),
  q("fer-ogres", "The Ogres of Feralas", "feralas", "quest", "alliance", 47),
  q("fer-gordunni", "Gordunni Cobalt", "feralas", "quest", "horde", 47),
  // 50–60
  q("ung-apes", "The Apes of Un'Goro", "ungoro", "chain", "both", 53),
  q("ung-crystals", "Crystals of Power", "ungoro", "chain", "both", 53),
  q("ung-larion", "Larion and Muigin", "ungoro", "chain", "both", 53),
  q("fel-timbermaw", "Deadwood of the North", "felwood", "chain", "both", 54, "Öffnet den Weg zu Mondlichtung/Winterquell über die Holzschlundfeste."),
  q("fel-cleansing", "Cleansing Felwood", "felwood", "quest", "both", 55),
  q("ws-winterfall", "Winterfall Activity", "winterspring", "quest", "both", 56),
  q("ws-wildkin", "Wildkin of Elune", "winterspring", "quest", "both", 56),
  q("ws-yeti", "Are We There, Yeti?", "winterspring", "chain", "both", 57),
  q("epl-demon-dogs", "Demon Dogs", "eastern-plaguelands", "quest", "both", 54),
  q("epl-blood-skies", "Blood Tinged Skies", "eastern-plaguelands", "quest", "both", 55),
  q("epl-grubbage", "Carrion Grubbage", "eastern-plaguelands", "quest", "both", 55),
  q("wpl-cauldrons", "The Scourge Cauldrons", "western-plaguelands", "chain", "both", 55),
  q("wpl-watchtowers", "All Along the Watchtowers", "western-plaguelands", "quest", "alliance", 56),
];

export const questById = new Map(quests.map((x) => [x.id, x]));
