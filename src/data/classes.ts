import type { ClassCriterion, ClassGuide, ClassId } from "@/lib/types";
import { v } from "./verify";

export const classCriteria: ClassCriterion[] = [
  { id: "comfort", label: "Komfort beim Solo-Questing" },
  { id: "selfheal", label: "Selbstheilung & Überleben" },
  { id: "downtime", label: "Downtime & Ressourcen" },
  { id: "speed", label: "Kampf- & Leveltempo" },
  { id: "gear", label: "Unabhängigkeit von Ausrüstung" },
  { id: "multi", label: "Mehrere Gegner" },
  { id: "elites", label: "Schwierige Elitequests" },
  { id: "complexity", label: "Einfache Spielweise" },
  { id: "endgame", label: "Nutzen in Dungeons & auf 60" },
];

const classicTalent = (note: string) =>
  v.classic(`${note} Forever-Talentbäume sind überarbeitet – im Talentrechner prüfen.`);

export const classGuides: ClassGuide[] = [
  {
    id: "druid",
    name: "Druide",
    summary:
      "Der flexibelste Solo-Leveler: Katze zum Questen, Bär für Notfälle und Elites, Heilung zwischen den Kämpfen und ab Stufe 30 die Reisegestalt. Kaum Ausrüstungsabhängig. Achtung: In Forever die am stärksten umgebaute Klasse – Details können sich bis zum Release noch ändern.",
    roles: ["Nahkampf (Katze)", "Tank (Bär)", "Heiler", "Fernkampf (Gleichgewicht)"],
    ratings: [
      { criterionId: "comfort", rating: "sehr gut", text: "Schleichen umgeht unnötige Kämpfe, Reisegestalt ab 30 spart viel Laufzeit." },
      { criterionId: "selfheal", rating: "gut", text: "Gestalt verlassen, heilen, zurückwechseln. Kostet Mana, ist aber sehr verlässlich." },
      { criterionId: "downtime", rating: "sehr gut", text: "Katze/Bär nutzen Energie/Wut statt Mana; Mana regeneriert während des Kampfes in Gestalt." },
      { criterionId: "speed", rating: "gut", text: "Bis 20 langsam (Zauber + Nahkampf in Bärengestalt), ab Katzengestalt deutlich schneller." },
      { criterionId: "gear", rating: "sehr gut", text: "Gestalten skalieren mit Werten statt Waffenschaden – Waffen-Upgrades sind kaum relevant (Classic-Mechanik)." },
      { criterionId: "multi", rating: "gut", text: "Bärengestalt mit Prankenhieb/Demoralisierendem Gebrüll hält 2–3 Gegner gut aus." },
      { criterionId: "elites", rating: "gut", text: "Bär + Heilen zwischendurch macht viele Elitequests solo machbar." },
      { criterionId: "complexity", rating: "mittel", text: "Gestaltwechsel und Buffs verlangen etwas Übung, sind aber gut erlernbar." },
      { criterionId: "endgame", rating: "gut", text: "Kann tanken, heilen und Schaden machen; durch Forever-Umbau aktuell schwer einschätzbar." },
    ],
    soloSpec: {
      name: "Wilder Kampf (Feral) – Katze",
      why: "Mehrere Forever-Leveling-Guides (Icy Veins, Warcraft Tavern) empfehlen Feral; Primal Bite ist die zentrale Schadensfähigkeit.",
    },
    talentMilestones: [
      {
        levels: "10–19",
        focus: "Wilder Kampf: Überleben in Bärengestalt",
        details: [
          "Punkte in Feral-Talente für Bärengestalt (Rüstung/Wut) und Schaden.",
          "Konkrete Talentnamen nicht übernehmen: 47 von 52 Druiden-Talenten sind in Forever neu oder geändert.",
        ],
        verification: v.provisional(["wfg-class-changes", "iv-feral-leveling"], "Allgemeine Richtung; Namen im Forever-Talentrechner prüfen."),
      },
      {
        levels: "20",
        focus: "Omen der Klarsicht ist Grundfähigkeit",
        details: ["Omen der Klarsicht wird in Forever ab Stufe 20 ohne Talentpunkt erlernt (laut Beta-Guides; in einem Build noch nicht trainierbar gemeldet)."],
        verification: v.beta(["wfg-druid", "lfcarry-class-changes"], "Mehrere Guides bestätigen Stufe 20; ein Guide meldet Inkonsistenz im Client."),
      },
      {
        levels: "~25",
        focus: "Primal Bite (ehemals Zerfleischen)",
        details: ["Feral-Talent; laut Icy Veins Hauptschadensfähigkeit, auf Abklingzeit nutzen.", "Freischaltstufe je nach Quelle 25 oder Talentpunkt 16."],
        verification: v.beta(["iv-feral-leveling", "wfg-druid"], "Stufe uneinheitlich angegeben."),
      },
      {
        levels: "26–39",
        focus: "Katzenschaden und Energie",
        details: ["Weitere Feral-Punkte in Katzenschaden/kritische Treffer.", "Tigerfuror existiert in Forever nicht mehr – Ersatz über Talente laut Beta."],
        verification: v.provisional(["wfg-class-changes", "lfcarry-class-changes"]),
      },
      {
        levels: "40–60",
        focus: "Berserk und Abschluss Feral",
        details: ["Berserk ab Stufe 40: Primal Bite jede globale Abklingzeit nutzbar (Icy Veins).", "Restpunkte nach Forever-Talentrechner verteilen."],
        verification: v.beta(["iv-feral-leveling"]),
      },
    ],
    abilities: [
      { name: "Bärengestalt", level: 10, note: "Klassenquest in der Mondlichtung (Classic).", verification: v.classic() },
      { name: "Wassergestalt", level: 16, note: "Klassenquest (Classic).", verification: v.classic() },
      { name: "Katzengestalt + Schleichen", level: 20, note: "Hauptgestalt zum Leveln.", verification: v.classic() },
      { name: "Omen der Klarsicht", level: 20, note: "In Forever Grundfähigkeit statt Talent.", foreverChange: true, verification: v.beta(["wfg-druid", "lfcarry-class-changes"]) },
      { name: "Primal Bite", level: 25, note: "Ersetzt Zerfleischen (Mangle), Feral-Talent.", foreverChange: true, verification: v.beta(["iv-feral-leveling", "lfcarry-class-changes"]) },
      { name: "Reisegestalt", level: 30, note: "+40 % Laufgeschwindigkeit – größter Komfortgewinn.", verification: v.classic() },
      { name: "Terrorbärengestalt", level: 40, note: "Stärkere Bärengestalt (Classic).", verification: v.classic() },
      { name: "Berserk", level: 40, note: "Primal Bite ohne Abklingzeit für kurze Zeit.", foreverChange: true, verification: v.beta(["iv-feral-leveling"]) },
    ],
    rotation: [
      "Schleichen → Anspringen/Krallenhieb → Primal Bite auf Abklingzeit.",
      "Combopunkte mit Krallenhieb aufbauen, mit Wilder Biss/Zerfetzen abschließen.",
      "Klarsicht-Procs (Omen) für teure Fähigkeiten nutzen.",
      "Mehrere Gegner oder Elite: in Bärengestalt wechseln.",
    ],
    resourceTips: [
      "Vor dem Kampf Buffs (Mal der Wildnis, Dornen) erneuern, danach in Gestalt bleiben.",
      "Mana regeneriert in Gestalt – Heilung erst nach dem Kampf.",
      "Essen reicht meistens; Trinken nur nach Heilphasen.",
    ],
    hardEnemyTips: [
      "Elites in Bärengestalt tanken, bei 40 % Leben einmal verlassen und heilen.",
      "Wurzeln (Umschlingen) + Mondfeuer, um Caster herauszuziehen.",
      "Schleichen nutzen, um Gruppen zu umgehen statt zu kämpfen.",
    ],
    gearPriorities: ["Beweglichkeit und Stärke (Leder)", "Ausdauer für Bärengestalt", "Waffe nur nach Werten wählen, nicht nach Schaden"],
    alternative: {
      name: "Gleichgewicht erst ab 60",
      when: "Zum Leveln nicht empfohlen (hoher Manaverbrauch). Wiederherstellung lohnt sich ab 60 als Heiler.",
    },
    foreverChanges: [
      { text: "47 von 52 Druiden-Talenten sind neu oder geändert.", verification: v.beta(["wfg-class-changes"]) },
      { text: "Zerfleischen heißt jetzt Primal Bite; Bedrohung etwa verdoppelt.", verification: v.beta(["lfcarry-class-changes", "wfg-druid"]) },
      { text: "Tigerfuror entfällt; Bärengestalt erhält mehr Wut durch kritische Treffer.", verification: v.beta(["lfcarry-class-changes"]) },
      { text: "Omen der Klarsicht ist kein Talent mehr (Grundfähigkeit ab 20).", verification: v.beta(["lfcarry-class-changes", "wfg-druid"]) },
      { text: "Skyborne können auf beiden Fraktionen Druide spielen.", verification: v.confirmed(["blizz-skyborne"]) },
      { text: "Tauren: Ausdauer (Endurance) erhöht zusätzlich kritischen Schaden und kritische Heilung.", verification: v.beta(["iv-oct15", "blizz-devnotes"], undefined, "Beta 1.60.1.70425 (15. Okt. 2026)") },
    ],
    verification: v.beta(["iv-feral-leveling", "warcrafttavern-druid", "lfcarry-class-changes"], "Klassenbewertung ist eine Einschätzung auf Basis von Classic-Erfahrung und Beta-Berichten."),
  },
  {
    id: "paladin",
    name: "Paladin",
    summary:
      "Sehr robust und einfach zu spielen: Siegel, Richturteil, Heilung, Gottesschild. Gemütliches, aber anfangs eher langsames Leveltempo und spürbar abhängig von einer guten Zweihandwaffe. In Forever erstmals auch für die Horde (Untote).",
    roles: ["Nahkampf (Vergeltung)", "Tank (Schutz)", "Heiler (Heilig)"],
    ratings: [
      { criterionId: "comfort", rating: "gut", text: "Wenig Tod-Risiko, aber kein Fernkampf und keine Reisegestalt (Reittier-Quest ab 40, Classic)." },
      { criterionId: "selfheal", rating: "sehr gut", text: "Heilige Lichter, Handauflegung und Gottesschild – die sicherste der drei Klassen." },
      { criterionId: "downtime", rating: "mittel", text: "Mana ist der Engpass; Icy Veins empfiehlt, Mana als „Verlängerung des Lebens“ zu sehen." },
      { criterionId: "speed", rating: "mittel", text: "Bis ca. 20 langsam, mit Siegel des Befehls und guter Waffe deutlich besser." },
      { criterionId: "gear", rating: "schwach", text: "Schaden hängt stark von der Zweihandwaffe ab – Dungeon-/Questwaffen sind wichtig." },
      { criterionId: "multi", rating: "mittel", text: "Hält viel aus, tötet Gruppen aber langsam (Weihe kostet viel Mana)." },
      { criterionId: "elites", rating: "gut", text: "Gottesschild und Heilung machen viele Elites solo möglich, wenn auch zäh." },
      { criterionId: "complexity", rating: "sehr gut", text: "Kurze Prioritätenliste, kaum Fehlerpotenzial." },
      { criterionId: "endgame", rating: "gut", text: "Heiler gefragt; in Forever mit Siegel des Furors als Tank-Option." },
    ],
    soloSpec: {
      name: "Vergeltung (Retribution)",
      why: "Forever-Guides (Method, Zockify, Conquest Capped) empfehlen Vergeltung für Solo-Questing: Siegel des Befehls, einfache Rotation.",
    },
    talentMilestones: [
      {
        levels: "10–19",
        focus: "Vergeltung: Richtung Siegel des Befehls",
        details: ["Punkte im Vergeltungsbaum bis zur Reihe mit Siegel des Befehls.", "Exakte Talentnamen der ersten Reihen im Forever-Talentrechner prüfen."],
        verification: v.provisional(["method-paladin", "zockify-paladin"]),
      },
      {
        levels: "20–29",
        focus: "Siegel des Befehls + Zweihandwaffe",
        details: ["Siegel des Befehls lernen, dann Zweihand-Waffenspezialisierung."],
        verification: v.beta(["cc-paladin-leveling", "zockify-paladin"]),
      },
      {
        levels: "30–39",
        focus: "Twist of Light",
        details: ["Neues Vergeltungstalent: Siegel wechseln, während der nächste Schlag noch das alte Siegel anwendet (laut Method von Vergeltungs-Paladinen gewählt)."],
        verification: v.beta(["method-paladin", "lfcarry-class-changes"]),
      },
      {
        levels: "40–60",
        focus: "Vergeltung abschließen",
        details: ["Zockify nennt als Leveling-Endbuild 12/8/31 (Heilig/Schutz/Vergeltung).", "Restpunkte nach Forever-Talentrechner."],
        verification: v.beta(["zockify-paladin"]),
      },
    ],
    abilities: [
      { name: "Siegel der Rechtschaffenheit", level: 1, note: "Standardsiegel bis Siegel des Befehls.", verification: v.classic() },
      { name: "Richturteil", level: 4, note: "Entlädt das Siegel; auf Abklingzeit nutzen.", verification: v.classic() },
      { name: "Holy Strike", note: "In Forever Kernfähigkeit laut Icy Veins; Abklingzeit im Heilig-Baum 10 statt 12 s.", foreverChange: true, verification: v.beta(["iv-ret-paladin", "lfcarry-class-changes"]) },
      { name: "Hammer der Gerechtigkeit", level: 8, note: "Betäubung – Notbremse und Caster-Unterbrechung.", verification: v.classic() },
      { name: "Handauflegung", level: 10, note: "Volle Heilung, lange Abklingzeit.", verification: v.classic() },
      { name: "Lichtblitz", level: 20, note: "Günstige Heilung zwischen Kämpfen.", verification: v.classic() },
      { name: "Siegel des Befehls", level: 20, note: "Vergeltungstalent, großer Schadensschub mit langsamen Zweihändern.", verification: v.classic() },
      { name: "Gottesschild", level: 34, note: "Unverwundbarkeit – Rettung aus fast jeder Lage.", verification: v.classic() },
      { name: "Siegel des Furors", note: "Neues Tank-Siegel (Absorptionsschilde, Richturteil verspottet). Für Solo-Leveling nicht nötig.", foreverChange: true, verification: v.beta(["lfcarry-class-changes", "cc-class-changes"]) },
    ],
    rotation: [
      "Siegel aktiv halten (Rechtschaffenheit, ab 20 Befehl).",
      "Richturteil und Holy Strike auf Abklingzeit, wenn Mana vorhanden.",
      "Siegel nach Richturteil sofort erneuern.",
      "Bei < 30 % Leben: Lichtblitz/Heiliges Licht, im Notfall Gottesschild.",
    ],
    resourceTips: [
      "Segen der Weisheit beim Questen statt Macht, wenn Mana knapp ist.",
      "Weniger Richturteile bei leichten Gegnern – Autoangriffe tragen viel Schaden.",
      "Essen und Trinken gleichzeitig nutzen; Erste Hilfe verringert Manaverbrauch für Heilung.",
    ],
    hardEnemyTips: [
      "Hammer der Gerechtigkeit für Caster-Unterbrechungen.",
      "Gottesschild + Ruhestein als Fluchtweg.",
      "Elites mit vollem Mana beginnen, Handauflegung bereithalten.",
    ],
    gearPriorities: ["Langsame Zweihandwaffe mit hohem Schaden", "Stärke", "Ausdauer / Intelligenz"],
    alternative: {
      name: "Schutz mit Siegel des Furors",
      when: "Nur wenn du viele Dungeons als Tank laufen willst – Solo-Questing ist mit Vergeltung bequemer.",
    },
    foreverChanges: [
      { text: "Untote können Paladin spielen (erste Horde-Option).", verification: v.confirmed(["iv-race-guide"]) },
      { text: "Neues Siegel des Furors (Tank-Siegel mit Absorption, Richturteil verspottet).", verification: v.beta(["lfcarry-class-changes"]) },
      { text: "Holy Strike stärker, Abklingzeit im Heilig-Baum 10 s.", verification: v.beta(["lfcarry-class-changes"]) },
      { text: "Neues Vergeltungstalent Twist of Light.", verification: v.beta(["lfcarry-class-changes", "method-paladin"]) },
      { text: "Völker: Waffenspezialisierungen von Mensch und Zwerg wurden durch Krit-Boni ersetzt – Waffenwahl ist nicht mehr an das Volk gebunden.", verification: v.beta(["iv-oct15", "blizz-devnotes"], "Details je Volk im Original prüfen.", "Beta 1.60.1.70425 (15. Okt. 2026)") },
    ],
    verification: v.beta(["iv-ret-paladin", "method-paladin", "zockify-paladin"], "Klassenbewertung ist eine Einschätzung."),
  },
  {
    id: "priest",
    name: "Priester",
    summary:
      "Schatten-Priester levelt mit DoTs und Zauberstab sehr effizient und mit wenig Pausen. Stoff-Rüstung macht ihn anfangs verwundbar. Auf 60 der gefragteste Heiler – Forever ergänzt Penance, Divine Aegis und Gebet der Besserung.",
    roles: ["Fernkampf (Schatten)", "Heiler (Disziplin/Heilig)"],
    ratings: [
      { criterionId: "comfort", rating: "mittel", text: "Fernkampf und Schild sind angenehm, aber Patrouillen und Adds sind gefährlicher als bei Platte/Bär." },
      { criterionId: "selfheal", rating: "gut", text: "Machtwort: Schild, Erneuerung und Heilungen; nur Stoffrüstung." },
      { criterionId: "downtime", rating: "gut", text: "Willensentzug + Zauberstab reduziert Trinkpausen deutlich." },
      { criterionId: "speed", rating: "gut", text: "Bis ~20 durch Zauberstab bestimmt, danach mit Gedankenschinden zügig." },
      { criterionId: "gear", rating: "mittel", text: "Ein guter Zauberstab ist wichtig; sonst wenig abhängig." },
      { criterionId: "multi", rating: "mittel", text: "Psychischer Schrei und Schild helfen, aber mehrere Gegner bleiben riskant." },
      { criterionId: "elites", rating: "mittel", text: "Machbar mit DoTs + Schild, aber wenig Spielraum für Fehler." },
      { criterionId: "complexity", rating: "mittel", text: "DoTs, Mana und Zauberstab-Timing erfordern Aufmerksamkeit." },
      { criterionId: "endgame", rating: "sehr gut", text: "Heiler immer gefragt; Forever erweitert Disziplin und Heilig deutlich." },
    ],
    soloSpec: {
      name: "Schatten",
      why: "Mehrere Forever-Guides nennen Schatten die angenehmste Solo-Spezialisierung (DoTs + Zauberstab).",
    },
    talentMilestones: [
      {
        levels: "10–19",
        focus: "Willensentzug (Spirit Tap) und Zauberstab",
        details: ["Willensentzug für Regeneration nach Kills; Zauberstab-Spezialisierung (Disziplin) optional."],
        verification: v.provisional(["zockify-priest", "wfg-priest"], "Classic-Muster, laut Forever-Guides weiterhin empfohlen; Talentnamen prüfen."),
      },
      {
        levels: "20–30",
        focus: "Gedankenschinden und verbessertes SW:Schmerz",
        details: ["Gedankenschinden als Hauptfüller.", "Ein Guide nennt für Stufe 30 einen 2/0/19-Build."],
        verification: v.beta(["wfg-priest"], "Build-Angaben je Guide unterschiedlich."),
      },
      {
        levels: "30–40",
        focus: "Richtung Schattengestalt",
        details: ["Schattentalente bis Schattengestalt (Punkt 31)."],
        verification: classicTalent("Schattengestalt bei 31 Punkten ist Classic-Stand; ein Forever-Guide bestätigt Punkt 31."),
      },
      {
        levels: "40–60",
        focus: "Schattengestalt und Abschluss",
        details: ["Ein Guide nennt als Endbuild 2/0/49 – im Forever-Talentrechner gegenprüfen."],
        verification: v.beta(["wfg-priest"]),
      },
    ],
    abilities: [
      { name: "Schattenwort: Schmerz", level: 4, note: "Erster DoT, immer zuerst.", verification: v.classic() },
      { name: "Machtwort: Schild", level: 6, note: "Vor jedem Kampf – verhindert Zauber-Unterbrechung.", verification: v.classic() },
      { name: "Gedankenschlag", level: 10, note: "Starker Opener.", verification: v.classic() },
      { name: "Psychischer Schrei", level: 14, note: "Notfall bei mehreren Gegnern.", verification: v.classic() },
      { name: "Gedankenschinden", level: 20, note: "Schatten-Talent, Hauptfüller.", verification: v.classic() },
      { name: "Verschlingende Seuche", level: 20, note: "Laut Beta-Guides in Forever für alle Priester ab 20; Abklingzeit seit dem Beta-Update vom 15. Okt. 24 s (vorher 1 min) – fester Teil jeder Rotation.", foreverChange: true, verification: v.beta(["lfcarry-patch-notes", "blizz-devnotes", "zockify-priest"], "Abklingzeit laut Patchnotes-Zusammenfassungen zum 15. Okt.", "Beta 1.60.1.70425 (15. Okt. 2026)") },
      { name: "Schattengestalt", level: 40, note: "Mehr Schattenschaden, weniger erlittener Schaden.", verification: v.classic() },
      { name: "Penance", note: "Disziplin-Fähigkeit in Forever; Freischaltung uneinheitlich (Stufe 35 oder 21 Punkte).", foreverChange: true, verification: v.beta(["zockify-priest", "lfcarry-class-changes"]) },
    ],
    rotation: [
      "Machtwort: Schild → Schattenwort: Schmerz → Gedankenschlag.",
      "Verschlingende Seuche auf Abklingzeit (24 s seit 15. Okt.).",
      "Bis 20: Rest mit Zauberstab; ab 20 Gedankenschinden.",
      "Gegner mit wenig Leben per Zauberstab beenden, um Mana zu sparen.",
    ],
    resourceTips: [
      "Willensentzug-Proc nach Kills ausnutzen und direkt weiterziehen.",
      "Zauberstab-Upgrades (Verzauberkunst oder AH) haben hohe Priorität.",
      "Zauberstab feuert seit dem 15. Okt. erst nach 0,5 s Stillstand – nicht im Laufen schießen wollen.",
      "Trinken nur, wenn Mana unter ca. 30 % ist.",
    ],
    hardEnemyTips: [
      "Schild vor dem Pull, DoTs aus maximaler Entfernung.",
      "Psychischer Schrei nur, wenn keine weiteren Gegner in Fluchtrichtung stehen.",
      "Elites: alle DoTs, dann Gedankenschinden; Verblassen bei Gruppenquests.",
    ],
    gearPriorities: ["Zauberstab mit hohem DPS", "Willenskraft (Willensentzug) und Intelligenz", "Ausdauer"],
    alternative: {
      name: "Disziplin mit Penance",
      when: "Nur wenn du viel heilen willst (Dungeons). Zum Solo-Leveln ist Schatten schneller.",
    },
    foreverChanges: [
      { text: "Disziplin erhält Penance und Divine Aegis.", verification: v.beta(["lfcarry-class-changes"]) },
      { text: "Heilig endet in Gebet der Besserung (Prayer of Mending).", verification: v.beta(["lfcarry-class-changes"]) },
      { text: "Gnome können Priester spielen.", verification: v.confirmed(["iv-race-guide"]) },
      { text: "Verschlingende Seuche für alle Priester; Abklingzeit 24 s statt 1 min (15. Okt.).", verification: v.beta(["lfcarry-patch-notes", "blizz-devnotes"], undefined, "Beta 1.60.1.70425 (15. Okt. 2026)") },
      { text: "Zauberstäbe (und Automatischer Schuss) brauchen 0,5 s Stillstand vor dem Schuss.", verification: v.beta(["iv-oct15", "blizz-devnotes"], undefined, "Beta 1.60.1.70425 (15. Okt. 2026)") },
    ],
    verification: v.beta(["mobalytics-priest", "zockify-priest", "wfg-priest"], "Klassenbewertung ist eine Einschätzung."),
  },
];

export const classById = new Map<ClassId, ClassGuide>(classGuides.map((c) => [c.id, c]));

/** Begründete Empfehlung für den Spielstil „entspanntes Solo-Questing“. */
export const classRecommendation = {
  pick: "druid" as ClassId,
  headline: "Empfehlung: Druide (Feral) – mit Paladin als bewusst einfachere Alternative",
  reasons: [
    "Am wenigsten Leerlauf: Katze/Bär brauchen kein Mana, Heilung und Reisegestalt sind eingebaut.",
    "Reisegestalt ab 30 passt genau zum Wunsch nach wenig Laufwegen.",
    "Kaum Ausrüstungsdruck – du musst nicht auf Waffen aus Dungeons warten.",
    "Bärengestalt macht Elitequests und Fehler-Pulls verzeihlich.",
  ],
  caveats: [
    "Der Druide ist in Forever am stärksten umgebaut; Talente können sich bis zum Release noch ändern.",
    "Wer eine möglichst simple Rotation und maximale Sicherheit will, ist mit dem Paladin glücklicher – dafür langsamer und waffenabhängig.",
    "Wer auf 60 vor allem heilen will, wählt Priester und levelt als Schatten.",
  ],
  verification: v.provisional(
    ["iv-feral-leveling", "iv-ret-paladin", "mobalytics-priest", "lfcarry-class-changes"],
    "Eigene Abwägung auf Basis der Quellen und Classic-Erfahrung – keine Messung.",
  ),
};
