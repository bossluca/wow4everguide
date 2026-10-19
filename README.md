# Forever Companion – WoW Forever Leveling 1–60

Minimalistische Web-App, die Solo-Spieler durch die Levelphase von **World of Warcraft: Forever** führt:
Levelroute für Allianz und Horde, Klassenvergleich (Paladin, Priester, Druide), Berufe- und Goldplanung,
Fortschritt mit lokaler Speicherung. Keine Anmeldung, keine Datenbank, kein Backend.

> **Datenstand:** 19.10.2026, kurz vor dem Release am 4.11.2026 (Beta bis 21.10., Level-Cap der Beta 30).
> Viele Forever-Details sind noch nicht öffentlich dokumentiert. Die App kennzeichnet jeden Datensatz
> mit einem Verifikationsstatus und zeigt Lücken offen an, statt Inhalte zu erfinden.

## Funktionen

| Bereich | Inhalt |
| --- | --- |
| **Dashboard** | Stufe und Fortschritt bis 60, Klasse/Fraktion, aktuelles und nächstes Gebiet, nächste Aufgaben (abhakbar), Quest-Hubs, Sammelressourcen mit Skill-Abgleich, Hinweise zur Levelphase, Schnellbutton „Nächste Aufgabe erledigt“ |
| **Levelroute** | 21 Allianz- und 19 Horde-Abschnitte von 1–60 mit Stationen, Hubs, Questketten, optionalen Dungeons, Reisewegen, Trainern, Berufshinweisen, Warnungen, Wechselkriterien und Datenlücken. Filter: Fraktion, Klasse, Level, Gebiet, Volltextsuche, nur offene/wichtige, eigener Startzweig |
| **Klassen** | Vergleichstabelle über 9 Kriterien, begründete Empfehlung, pro Klasse: Solo-Spezialisierung, Talent-Meilensteine, Fähigkeiten mit Trainingsstufen, Kampfablauf, Ressourcen, schwierige Gegner, Ausrüstung, Alternative, Forever-Änderungen |
| **Berufe & Gold** | Empfehlung pro Klasse, Vergleich von 6 Kombinationen nach 5 Zielen, eigene Berufe/Skills (2 Hauptberufe + Nebenberufe), Ressourcen pro Gebiet inkl. „Umweg lohnt?“, Ressourcen-Finder, Gold-/Materialplan je Levelabschnitt, Rezepte |
| **Fortschritt** | Charakter (Stufe, Fraktion, Klasse, Volk, Gebiet), Fortschritt pro Gebiet, offene/erledigte Aufgaben, Notizen, JSON-Export/-Import, Zurücksetzen mit Bestätigungsdialog |
| **Quellen & Lücken** | Verifikationslegende, gesicherte Forever-Fakten, Liste offener Datenlücken, Quellenübersicht (Titel, URL, Thema, Prüfdatum) |

Außerdem: globale Suche (Strg/⌘ + K), Dark Mode als Standard (Light Mode umschaltbar), Sidebar am Desktop und
Menü-Sheet auf dem Smartphone. Klasse und Fraktion lassen sich jederzeit wechseln, ohne den Fortschritt zu verlieren.

## Tech-Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix, Stil „new-york“) · Lucide Icons ·
localStorage · Vitest + Testing Library · Playwright (Smoke-Test)

## Installation & Start

```bash
npm install
npm run dev          # Entwicklung: http://localhost:3000
npm run build        # Produktions-Build
npm run start        # Produktionsserver
```

Node.js ≥ 20 wird empfohlen.

## Qualitätsprüfung

```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run test         # Vitest: Datenintegrität, Ableitungslogik, Import-Validierung, Store/Persistenz
npm run check        # alle drei hintereinander

# End-to-End (Server muss laufen, z. B. npm run build && npm run start):
npm run e2e          # Navigation, Filter, Persistenz über Reload, Export/Import, Reset, Mobile-Layout
SCREENSHOT_DIR=./shots npm run e2e   # zusätzlich Screenshots
```

Der E2E-Test nutzt Chromium aus `/opt/pw-browsers/chromium`, falls vorhanden, sonst die Playwright-Standardinstallation
(`npx playwright install chromium`).

## Projektstruktur

```
src/
  app/                 Routen (dünne Seiten, rendern View-Komponenten)
  components/
    ui/                shadcn/ui-Bausteine
    layout/            App-Shell, Navigation, Suche, Theme
    shared/            Badges (Verifikation, Fraktion, Level), Charakterformular
    dashboard/ route/ classes/ professions/ progress/ sources/
  data/                ALLE Spielinhalte – getrennt von der Darstellung
    sources.ts         Quellenübersicht
    verify.ts          Helfer für Verifikationsstatus + Recherchedatum
    zones.ts resources.ts dungeons.ts quests.ts races.ts
    route/alliance.ts route/horde.ts
    classes.ts professions.ts hints.ts gaps.ts
  lib/
    types.ts           Typisierte Datenmodelle
    progress.ts        Speicherformat, Validierung/Normalisierung für Import
    store.ts           localStorage-Store (useSyncExternalStore) + Aktionen
    derive.ts          Ableitungen: aktueller Abschnitt, nächste Aufgaben, Fortschritt, Ressourcen
    search.ts          Suchindex
tests/                 Vitest
e2e/smoke.mjs          Playwright-Smoke-Test
```

## Verifikationsstatus

Jeder Routenabschnitt, jede Klassen- und Berufsangabe trägt ein `Verification`-Objekt (Status, Quellen-IDs, Version, Prüfdatum, Hinweis).
In der App öffnet ein Klick auf das Badge die Quellen.

| Status | Bedeutung |
| --- | --- |
| **Bestätigt** | Durch offizielle Informationen oder belastbare aktuelle Spieldaten belegt |
| **Beta-getestet** | In einer konkreten Beta-Version beschrieben (Builds 1.60.1.70425–70450, Okt. 2026) |
| **Klassische Referenz** | Aus Classic Era übernommen, für Forever nicht verifiziert |
| **Vorläufig** | Plausible Empfehlung, muss noch geprüft werden |

## Datenquellen

Die vollständige Liste mit URLs und Prüfdatum steht in `src/data/sources.ts` und in der App unter **Quellen & Lücken**.
Wichtigste Quellen: Blizzard News (Beta-Start, Skyborne, Legacy-System), Warcraft Wiki, Wowhead Forever, Icy Veins
(Dungeons, Camping, Erste-Hilfe-Änderung, Klassen-Guides), Method, Mobalytics, Zockify, LFCarry, Conquest Capped,
Kotaku (Beta-Änderungen).

**Einschränkung der Recherche:** Die Quellseiten konnten aus der Build-Umgebung nicht im Volltext abgerufen werden;
geprüft wurde über Suchergebnis-Auszüge. Widersprüchliche Angaben sind in den Datensätzen vermerkt.

## Bekannte Grenzen und Datenlücken

- Namen und Reihenfolge der über 1.000 neuen Forever-Quests sind größtenteils unbekannt → die Route nutzt klassische Questketten als Gerüst (gekennzeichnet).
- Riverglades: Hubs, Flugpunkte, Quests und Ressourcen fehlen; Shen'dralas: Levelbereich unbestätigt.
- Neue Sumpfland- und Desolace-Quests nicht namentlich bekannt; nur 5 der 9 neuen Dungeons erfasst.
- Forever-Talentbäume (v. a. Druide) stark überarbeitet → nur mehrfach belegte Talente, sonst Verweis auf den Talentrechner.
- Keine Auktionshauspreise (Spiel noch nicht veröffentlicht) → Goldhinweise sind allgemeine Einschätzungen.
- Flugpunkte und Ressourcen-Skillstufen sind Classic-Referenz.

Die aktuelle Liste pflegt `src/data/gaps.ts`.

## Daten aktualisieren

1. **Quelle anlegen:** Eintrag in `src/data/sources.ts` (ID, Titel, URL, Art, Themen, `checkedAt`).
2. **Datensatz ändern** in der passenden Datei unter `src/data/` und die Verifikation mit den Helfern aus `verify.ts` setzen,
   z. B. `v.confirmed(["neue-quelle"], "Hinweis")` oder `v.beta([...], "Hinweis", "Build x.y")`.
3. **Stations-IDs nie umbenennen** – sie sind die Schlüssel des gespeicherten Fortschritts. Neue Stationen bekommen neue IDs;
   entfernte IDs bleiben in alten Exporten harmlos liegen.
4. Recherchedatum `DATA_CHECKED_AT` und ggf. `BETA_BUILD` in `src/data/verify.ts` anpassen, gelöste Lücken aus `gaps.ts` entfernen.
5. `npm run check` ausführen – der Integritätstest prüft u. a. eindeutige IDs, gültige Referenzen auf Gebiete/Quests/Dungeons/Quellen
   und eine lückenlose Route 1–60 pro Fraktion.

Das Layout muss für neue Inhalte nicht angepasst werden.

## Speicherformat

Der Fortschritt liegt unter dem localStorage-Schlüssel `wowf-companion:v1` (Version 1). Export und Import nutzen dasselbe JSON;
beim Import werden unbekannte Felder verworfen und ungültige Werte auf sichere Standards gesetzt.
