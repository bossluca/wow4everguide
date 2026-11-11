import type { Continent, ForeverZoneStatus, Verification, Zone, ZoneFaction } from "@/lib/types";
import { v } from "./verify";

const classicZone = v.classic(
  "Levelbereich, Ressourcen und Flugpunkte aus Classic Era. Forever kann Details verändern.",
  ["mobalytics-zones"],
);

function zone(
  id: string,
  name: string,
  continent: Continent,
  [levelMin, levelMax]: [number, number],
  faction: ZoneFaction,
  resourceIds: string[],
  flightPaths: { alliance?: string[]; horde?: string[] },
  opts: {
    foreverStatus?: ForeverZoneStatus;
    notes?: string[];
    verification?: Verification;
    skinnable?: [number, number] | null;
  } = {},
): Zone {
  return {
    id,
    name,
    continent,
    levelMin,
    levelMax,
    faction,
    foreverStatus: opts.foreverStatus ?? "classic",
    resourceIds,
    skinnableLevels: opts.skinnable === null ? undefined : (opts.skinnable ?? [levelMin, levelMax]),
    flightPaths: { alliance: flightPaths.alliance ?? [], horde: flightPaths.horde ?? [] },
    notes: opts.notes,
    verification: opts.verification ?? classicZone,
  };
}

const starterHerbs = ["peacebloom", "silverleaf", "earthroot"];
const changedStart = v.provisional(
  ["outputlag-wetlands", "wiki-map-comparison"],
  "Forever bringt laut BlizzCon-Berichten neue Geschichten in Startgebieten; Umfang je Gebiet nicht im Detail dokumentiert.",
);

export const zones: Zone[] = [
  // Startgebiete
  zone("zephras-isle", "Zephras Isle (Skyborne)", "islands", [1, 12], "neutral", [], {}, {
    foreverStatus: "new",
    skinnable: null,
    notes: [
      "Startgebiet der Skyborne (benötigt Skyborne-Paket). Fraktionswahl Allianz/Horde fällt hier und ist endgültig.",
      "Skyborne können weder Paladin noch Priester spielen – nur als Druide relevant.",
    ],
    verification: v.confirmed(["blizz-skyborne", "forums-skyborne-guide"], "Ressourcen und Hubs nicht dokumentiert."),
  }),
  zone("elwynn", "Wald von Elwynn", "eastern-kingdoms", [1, 10], "alliance", [...starterHerbs, "copper"], { alliance: ["Sturmwind"] }, { foreverStatus: "changed", verification: changedStart }),
  zone("dun-morogh", "Dun Morogh", "eastern-kingdoms", [1, 10], "alliance", [...starterHerbs, "copper"], { alliance: ["Eisenschmiede"] }, { foreverStatus: "changed", verification: changedStart }),
  zone("teldrassil", "Teldrassil", "kalimdor", [1, 10], "alliance", starterHerbs, { alliance: ["Rut'theran (Darnassus)"] }, { notes: ["Kaum Erzvorkommen – Bergbau erst ab Dunkelküste sinnvoll."] }),
  zone("durotar", "Durotar", "kalimdor", [1, 10], "horde", [...starterHerbs, "copper"], { horde: ["Orgrimmar"] }),
  zone("mulgore", "Mulgore", "kalimdor", [1, 10], "horde", [...starterHerbs, "copper"], { horde: ["Donnerfels"] }),
  zone("tirisfal", "Tirisfal", "eastern-kingdoms", [1, 10], "horde", [...starterHerbs, "copper"], { horde: ["Unterstadt"] }, { foreverStatus: "changed", verification: changedStart }),
  // 10–20
  zone("westfall", "Westfall", "eastern-kingdoms", [10, 20], "alliance", [...starterHerbs, "mageroyal", "briarthorn", "copper", "tin", "silver"], { alliance: ["Späherkuppe"] }),
  zone("loch-modan", "Loch Modan", "eastern-kingdoms", [10, 20], "alliance", [...starterHerbs, "mageroyal", "briarthorn", "copper", "tin", "silver"], { alliance: ["Thelsamar"] }),
  zone("darkshore", "Dunkelküste", "kalimdor", [10, 20], "alliance", [...starterHerbs, "mageroyal", "briarthorn", "stranglekelp", "copper", "tin"], { alliance: ["Auberdine"] }),
  zone("barrens", "Brachland", "kalimdor", [10, 25], "horde", [...starterHerbs, "mageroyal", "briarthorn", "bruiseweed", "copper", "tin", "silver"], { horde: ["Wegkreuz", "Ratschet (neutral)", "Camp Taurajo"], alliance: ["Ratschet (neutral)"] }),
  zone("silverpine", "Silberwald", "eastern-kingdoms", [10, 20], "horde", [...starterHerbs, "mageroyal", "briarthorn", "copper", "tin", "silver"], { horde: ["Grabmal (The Sepulcher)"] }),
  zone("redridge", "Rotkammgebirge", "eastern-kingdoms", [15, 25], "alliance", ["mageroyal", "briarthorn", "bruiseweed", "copper", "tin", "silver", "iron"], { alliance: ["Seenhain"] }, {
    foreverStatus: "changed",
    verification: v.provisional(["mobalytics-zones"], "Laut Zonenvergleichen in Forever als verändert markiert (15–25)."),
  }),
  zone("stonetalon", "Steinkrallengebirge", "kalimdor", [15, 27], "contested", ["mageroyal", "briarthorn", "bruiseweed", "tin", "silver", "iron"], { alliance: ["Steinkrallengipfel"], horde: ["Sonnenfels"] }),
  // 20–30
  zone("duskwood", "Dämmerwald", "eastern-kingdoms", [18, 30], "alliance", ["briarthorn", "bruiseweed", "grave-moss", "tin", "silver", "iron"], { alliance: ["Dunkelhain"] }, {
    foreverStatus: "changed",
    verification: v.provisional(["mobalytics-zones"], "Laut Zonenvergleichen in Forever als verändert markiert."),
  }),
  zone("ashenvale", "Eschental", "kalimdor", [18, 30], "contested", ["mageroyal", "briarthorn", "stranglekelp", "bruiseweed", "wild-steelbloom", "tin", "silver", "iron"], { alliance: ["Astranaar"], horde: ["Splintertannenposten", "Zoram'gar"] }),
  zone("wetlands", "Sumpfland", "eastern-kingdoms", [20, 30], "alliance", ["briarthorn", "stranglekelp", "bruiseweed", "wild-steelbloom", "kingsblood", "tin", "silver", "iron", "gold"], { alliance: ["Menethil"] }, {
    foreverStatus: "revamped",
    notes: [
      "Forever: über 25 neue Quests und neue Levelpfade (BlizzCon 2026).",
      "Neuer Dungeon „Excavation Site: Wetlands“ oberhalb von Whelgars Ausgrabungsstätte.",
      "Neue Fähr-Schleife Menethil ↔ Süderstade ↔ Auberdine.",
    ],
    verification: v.confirmed(["outputlag-wetlands", "iv-dungeons-news", "gamesgg-wetlands"], "Neue Quests bestätigt; Questnamen noch nicht öffentlich. Fähr-Schleife laut Beta-Guide."),
  }),
  zone("hillsbrad", "Vorgebirge des Hügellands", "eastern-kingdoms", [20, 30], "contested", ["bruiseweed", "wild-steelbloom", "kingsblood", "tin", "silver", "iron", "gold"], { alliance: ["Süderstade"], horde: ["Tarrens Mühle"] }, {
    foreverStatus: "changed",
    verification: v.provisional(["mobalytics-zones"], "Forever-Karte: 20–30 statt 20–35 (Drittquelle)."),
  }),
  zone("thousand-needles", "Tausend Nadeln", "kalimdor", [25, 35], "contested", ["wild-steelbloom", "kingsblood", "liferoot", "silver", "iron", "gold"], { horde: ["Freiwindposten"] }),
  // 30–40
  zone("alterac", "Alteracgebirge", "eastern-kingdoms", [30, 40], "contested", ["kingsblood", "liferoot", "fadeleaf", "khadgars-whisker", "iron", "gold", "mithril"], {}, {
    foreverStatus: "changed",
    notes: ["Forever: neuer Dungeon „City of Dalaran“ (ca. 28–33) – die Barriere um Dalaran ist gefallen."],
    verification: v.beta(["iv-dungeons-news", "iv-dungeons-overview"], "Dalaran seit Beta-Update vom 8. Okt. testbar."),
  }),
  zone("arathi", "Arathihochland", "eastern-kingdoms", [30, 40], "contested", ["kingsblood", "liferoot", "fadeleaf", "goldthorn", "iron", "gold", "mithril"], { alliance: ["Zuflucht"], horde: ["Hammerfall"] }),
  zone("desolace", "Desolace", "kalimdor", [30, 40], "contested", ["kingsblood", "liferoot", "fadeleaf", "khadgars-whisker", "iron", "gold", "mithril"], { alliance: ["Nijels Spitze"], horde: ["Schattenflucht"] }, {
    foreverStatus: "revamped",
    notes: [
      "Forever: neue Quests für eine Zentauren-Fraktion inkl. neuer Belohnungen.",
      "Zugang zur neuen Region Shen'dralas über das Tal der Knochen im Süden.",
    ],
    verification: v.confirmed(["windowscentral-forever", "wiki-map-comparison"], "Neue Questreihe bestätigt; Fraktion, Questnamen und Levelbereich nicht dokumentiert."),
  }),
  zone("stranglethorn", "Schlingendorntal", "eastern-kingdoms", [30, 45], "contested", ["liferoot", "fadeleaf", "goldthorn", "khadgars-whisker", "purple-lotus", "iron", "gold", "mithril", "truesilver"], { alliance: ["Beutebucht (neutral)"], horde: ["Grom'gol", "Beutebucht (neutral)"] }, {
    foreverStatus: "changed",
    notes: ["Forever: Dungeon „The Drowned City“ (35–40) vor der Küste."],
    verification: v.provisional(["iv-dungeons-news", "wiki-map-comparison"], "Als verändert markiert; Quest-Änderungen nicht im Detail dokumentiert."),
  }),
  zone("dustwallow", "Düstermarschen", "kalimdor", [35, 45], "contested", ["kingsblood", "liferoot", "fadeleaf", "goldthorn", "iron", "gold", "mithril"], { alliance: ["Theramore"], horde: ["Brackenwall"] }, {
    notes: ["Forever: neuer Dungeon Alcaz Prison (48–53) auf der Insel Alcaz."],
  }),
  zone("riverglades", "The Riverglades", "eastern-kingdoms", [36, 44], "contested", [], { alliance: ["Farholde Keep"], horde: ["Rog'mar"] }, {
    foreverStatus: "new",
    skinnable: null,
    notes: [
      "Neue Zone (Größe ähnlich Schlingendorntal) zwischen Rotkammgebirge, Brennender Steppe, Ödland und Sümpfen des Elends.",
      "Hubs: Farholde Keep (Allianz), Rog'mar (Horde) und die Goblinstadt Powderfuse Port.",
      "Flugrouten laut Guide: Farholde Keep ↔ Seenhain, Thelsamar, Morgans Wacht; Rog'mar ↔ Steinard, Hammerfall, Kargath, Flammenkamm.",
      "Anreise per neuer Schiffsroute Steamwheedle Port (Tanaris) → Powderfuse Port oder über eine Abzweigung der Straße Rotkamm → Brennende Steppe.",
      "Laut Blizzard über 150 Quests (später „fast 200“ genannt). Neuer Dungeon Krol'dok Stronghold (40–45).",
    ],
    verification: v.beta(["wiki-forever", "wfg-riverglades", "realmfirst-riverglades"], "Beta-Bereich 36–44 (Blizzard: Mitte 30 bis Mitte 40). Ob Powderfuse Port einen Flugpunkt hat, ist widersprüchlich. Ressourcen unbekannt."),
  }),
  zone("badlands", "Ödland", "eastern-kingdoms", [35, 45], "contested", ["kingsblood", "fadeleaf", "goldthorn", "firebloom", "purple-lotus", "iron", "gold", "mithril", "truesilver"], { horde: ["Kargath"] }),
  zone("swamp-of-sorrows", "Sümpfe des Elends", "eastern-kingdoms", [35, 45], "contested", ["liferoot", "fadeleaf", "goldthorn", "blindweed", "iron", "gold", "mithril"], { horde: ["Steinard"] }),
  zone("shendralas", "Shen'dralas", "kalimdor", [40, 45], "contested", [], {}, {
    foreverStatus: "new",
    skinnable: null,
    notes: ["Zugang über das Tal der Knochen (Süd-Desolace). Levelbereich NICHT offiziell bestätigt (40–45 ist eine Drittquellen-Schätzung)."],
    verification: v.provisional(["wowhead-forever-map", "wiki-map-comparison"], "Levelbereich unbestätigt."),
  }),
  // 40–50
  zone("tanaris", "Tanaris", "kalimdor", [40, 50], "contested", ["firebloom", "purple-lotus", "mithril", "truesilver", "small-thorium"], { alliance: ["Gadgetzan"], horde: ["Gadgetzan"] }, {
    notes: ["Forever: Steamwheedle Port mit Schiff zu den Riverglades."],
  }),
  zone("feralas", "Feralas", "kalimdor", [40, 50], "contested", ["goldthorn", "khadgars-whisker", "purple-lotus", "sungrass", "mithril", "truesilver", "small-thorium"], { alliance: ["Mondfederfeste"], horde: ["Camp Mojache"] }),
  zone("hinterlands", "Hinterland", "eastern-kingdoms", [40, 50], "contested", ["goldthorn", "khadgars-whisker", "purple-lotus", "sungrass", "mithril", "truesilver", "small-thorium"], { alliance: ["Nistgipfel"], horde: ["Revantusk"] }),
  zone("searing-gorge", "Sengende Schlucht", "eastern-kingdoms", [43, 50], "contested", ["firebloom", "mithril", "truesilver", "small-thorium"], { alliance: ["Thoriumspitze"], horde: ["Thoriumspitze"] }),
  // 50–60
  zone("azshara", "Azshara", "kalimdor", [45, 55], "contested", ["sungrass", "golden-sansam", "small-thorium", "rich-thorium"], { alliance: ["Talrendisspitze"], horde: ["Valormok"] }, {
    notes: ["Forever: neuer Dungeon Blackmaw Hold (55–60) im Norden."],
  }),
  zone("ungoro", "Krater von Un'Goro", "kalimdor", [48, 55], "contested", ["sungrass", "golden-sansam", "dreamfoil", "small-thorium", "rich-thorium"], { alliance: ["Marschalls Zuflucht"], horde: ["Marschalls Zuflucht"] }, {
    notes: ["Forever: neuer Dungeon Shaper's Terrace (58–60)."],
  }),
  zone("felwood", "Teufelswald", "kalimdor", [48, 55], "contested", ["sungrass", "gromsblood", "golden-sansam", "dreamfoil", "plaguebloom", "small-thorium"], { alliance: ["Talonzweig"], horde: ["Blutgiftposten"] }),
  zone("burning-steppes", "Brennende Steppe", "eastern-kingdoms", [50, 58], "contested", ["sungrass", "golden-sansam", "dreamfoil", "mountain-silversage", "small-thorium", "rich-thorium"], { alliance: ["Morgans Wacht"], horde: ["Flammenkamm"] }),
  zone("western-plaguelands", "Westliche Pestländer", "eastern-kingdoms", [51, 58], "contested", ["sungrass", "golden-sansam", "dreamfoil", "plaguebloom", "small-thorium"], { alliance: ["Kühlwindlager"] }),
  zone("eastern-plaguelands", "Östliche Pestländer", "eastern-kingdoms", [53, 60], "contested", ["dreamfoil", "mountain-silversage", "plaguebloom", "rich-thorium"], { alliance: ["Kapelle des Hoffnungsvollen Lichts"], horde: ["Kapelle des Hoffnungsvollen Lichts"] }),
  zone("winterspring", "Winterquell", "kalimdor", [55, 60], "contested", ["dreamfoil", "mountain-silversage", "icecap", "rich-thorium"], { alliance: ["Ewige Warte"], horde: ["Ewige Warte"] }, {
    foreverStatus: "changed",
    verification: v.provisional(["mobalytics-zones"], "Forever-Karte: 55–60 statt 53–60 (Drittquelle)."),
  }),
  zone("silithus", "Silithus", "kalimdor", [55, 60], "contested", ["dreamfoil", "mountain-silversage", "rich-thorium"], { alliance: ["Burg Cenarius"], horde: ["Burg Cenarius"] }),
  zone("hyjal", "Hyjal", "kalimdor", [60, 60], "contested", [], {}, {
    foreverStatus: "new",
    skinnable: null,
    notes: ["Neue Endgame-Zone für Stufe 60 (nach Archimondes Niederlage). Kein Levelgebiet."],
    verification: v.confirmed(["wiki-forever", "wowhead-forever-map"], "Inhalte noch nicht dokumentiert."),
  }),
];

export const zoneById = new Map(zones.map((z) => [z.id, z]));

export function getZone(id: string): Zone {
  const z = zoneById.get(id);
  if (!z) throw new Error(`Unbekanntes Gebiet: ${id}`);
  return z;
}
