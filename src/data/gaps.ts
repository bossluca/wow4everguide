import type { DataGap, Verification } from "@/lib/types";
import { v } from "./verify";

/** Gesicherte Rahmendaten zu WoW Forever, die in der App angezeigt werden. */
export const foreverFacts: { text: string; verification: Verification }[] = [
  { text: "Release am 4. November 2026 (15:00 PST); Beta vom 17. September bis 21. Oktober 2026.", verification: v.confirmed(["blizz-beta-live", "wiki-forever"]) },
  { text: "Level-Cap 60. Die Beta war zuletzt auf Stufe 30 begrenzt (Erhöhung am 1. Oktober).", verification: v.confirmed(["blizz-beta-live", "kotaku-beta-changes"]) },
  { text: "XP-Bedarf pro Stufe identisch zu Classic (laut Blizzard im September bestätigt).", verification: v.beta(["wf-experience"], "Aussage über Drittquelle zitiert.") },
  { text: "Dungeonquests: Bonus-XP in der Beta um 50 % gesenkt (1. Okt.), später Dungeon-Kill-XP um ca. 20 % erhöht (8. Okt.).", verification: v.beta(["kotaku-beta-changes", "zockify-roadmap"], "Okt.-8-Änderung nur aus einer Quelle.") },
  { text: "Neue Zonen: Zephras Isle (1–12), The Riverglades (Mitte 30 – Mitte 40), Shen'dralas (Stufe offen), Hyjal (60).", verification: v.confirmed(["wiki-forever", "wowhead-forever-map"]) },
  { text: "Überarbeitete Zonen u. a. Sumpfland (25+ Quests) und Desolace (Zentauren-Questreihe).", verification: v.confirmed(["outputlag-wetlands", "windowscentral-forever"]) },
  { text: "Neue Dungeons: Hall of Thanes, Ruins of Lordaeron, Excavation Site: Wetlands, City of Dalaran, The Drowned City, Krol'dok Stronghold, Alcaz Prison, Shaper's Terrace sowie Blackmaw Hold (Zählung des neunten widersprüchlich).", verification: v.beta(["iv-dungeons-news", "wowhandbook-dungeons", "zockify-dungeons"]) },
  { text: "Beta-Update 15. Okt.: neue Völkerfähigkeiten, Zauberstäbe mit 0,5 s Stillstand, Gegner regenerieren wieder außerhalb des Kampfes, Verschlingende Seuche 24 s Abklingzeit.", verification: v.beta(["blizz-devnotes", "iv-oct15", "lfcarry-patch-notes"], undefined, "Beta 1.60.1.70425 (15. Okt. 2026)") },
  { text: "Neues Volk Skyborne (Paket nötig), neue Kombinationen u. a. Untoter Paladin und Gnom-Priester.", verification: v.confirmed(["blizz-skyborne", "iv-race-guide"]) },
  { text: "Legacy-System (accountweite Punkte, drei Perk-Bäume) und Camping mit Berufs-Lagerobjekten.", verification: v.confirmed(["blizz-legacy", "iv-camping"]) },
  { text: "Heiltränke werden in der Beta von Erster Hilfe hergestellt.", verification: v.beta(["iv-firstaid-potions"]) },
];

/** Offene Datenlücken – bewusst sichtbar statt erfunden. */
export const dataGaps: DataGap[] = [
  { id: "gap-quests", area: "Levelroute", text: "Namen, Reihenfolge und Hubs der über 1.000 neuen Forever-Quests sind größtenteils nicht öffentlich dokumentiert. Die Route nutzt deshalb klassische Questketten als Gerüst.", impact: "hoch" },
  { id: "gap-riverglades", area: "Riverglades", text: "Hubs (Farholde Keep, Rog'mar, Powderfuse Port) und Flugrouten sind aus Beta-Guides bekannt; Questketten und Ressourcen fehlen. Flugpunkt in Powderfuse Port widersprüchlich.", impact: "mittel" },
  { id: "gap-wetlands", area: "Sumpfland", text: "Die 25+ neuen Sumpfland-Quests sind nicht namentlich bekannt. Bekannt sind nur die Questgeber des Excavation-Site-Dungeons.", impact: "mittel" },
  { id: "gap-desolace", area: "Desolace", text: "Zentauren-Fraktion, Questgeber und Stufen der neuen Desolace-Quests fehlen.", impact: "mittel" },
  { id: "gap-shendralas", area: "Shen'dralas", text: "Levelbereich unbestätigt (40–45 nur Drittquellen-Schätzung).", impact: "mittel" },
  { id: "gap-zephras", area: "Zephras Isle", text: "Ablauf, Hubs und Reiseweg der Skyborne nach Stufe 12 nicht dokumentiert.", impact: "niedrig" },
  { id: "gap-dungeons", area: "Dungeons", text: "Alle neuen Dungeons sind mit Namen und Stufen erfasst, die vier höheren (ab 40) aber nur aus Übersichten – in der Beta nicht spielbar. Questgeber/Belohnungen fehlen außer bei Excavation Site.", impact: "niedrig" },
  { id: "gap-talents", area: "Talente", text: "Forever-Talentbäume (v. a. Druide) sind stark überarbeitet. Die App nennt nur Talente, die in mehreren Beta-Guides auftauchen, und verweist sonst auf den Talentrechner.", impact: "hoch" },
  { id: "gap-undead-paladin", area: "Paladin (Horde)", text: "Trainer-Standort und Klassenquests des Untoten Paladins nicht dokumentiert.", impact: "niedrig" },
  { id: "gap-recipes", area: "Berufe", text: "Über 600 neue Rezepte laut Beta-Datenauszügen, aber keine offizielle Liste. Konkrete neue Rezepte sind nur vereinzelt erfasst.", impact: "mittel" },
  { id: "gap-prices", area: "Gold", text: "Keine Auktionshauspreise verfügbar (Spiel noch nicht veröffentlicht). Alle Goldhinweise sind allgemeine Einschätzungen.", impact: "mittel" },
  { id: "gap-flightpaths", area: "Reisewege", text: "Flugpunkte sind Classic-Referenz; neue Forever-Verbindungen (Riverglades-Flugpunkte, Fähr-Schleife Menethil–Süderstade–Auberdine, Steamwheedle Port) stammen aus Beta-Guides.", impact: "mittel" },
  { id: "gap-access", area: "Recherche", text: "Quellseiten konnten aus der Build-Umgebung nicht im Volltext geladen werden; geprüft wurde über Suchergebnis-Auszüge.", impact: "mittel" },
];
