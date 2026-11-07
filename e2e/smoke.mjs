// End-to-End-Smoke-Test gegen einen laufenden Server (Standard: http://localhost:3000).
// Start: npm run build && npm run start  –  dann: npm run e2e
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOTS = process.env.SCREENSHOT_DIR;
const executablePath = existsSync("/opt/pw-browsers/chromium")
  ? "/opt/pw-browsers/chromium"
  : undefined;

const errors = [];
let failures = 0;
function check(cond, msg) {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    failures++;
    console.log(`  ✗ ${msg}`);
  }
}

const browser = await chromium.launch(executablePath ? { executablePath } : {});
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

async function newPage(viewport) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__active = () => {
      const d = JSON.parse(localStorage.getItem("wowf-companion:v2") ?? "null");
      return d ? d.profiles.find((p) => p.id === d.activeId).state : {};
    };
    window.__app = () => JSON.parse(localStorage.getItem("wowf-companion:v2") ?? "null");
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return { ctx, page };
}

// Desktop
{
  console.log("Desktop");
  const { ctx, page } = await newPage({ width: 1366, height: 900 });
  for (const path of ["/", "/route", "/classes", "/professions", "/progress", "/sources"]) {
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    check(res?.ok(), `${path} lädt (${res?.status()})`);
    check(await page.locator("h1").first().isVisible(), `${path} zeigt Überschrift`);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/desktop${path === "/" ? "-dashboard" : path.replace("/", "-")}.png`, fullPage: true });
  }

  // Charakter einrichten: Horde, Stufe 15
  await page.goto(BASE + "/progress", { waitUntil: "networkidle" });
  await page.getByRole("combobox", { name: "Fraktion" }).click();
  await page.getByRole("option", { name: "Horde" }).click();
  await page.getByRole("spinbutton", { name: "Aktuelle Stufe" }).fill("15");
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  check(await page.getByText("Brachland").first().isVisible(), "Dashboard leitet Brachland für Horde Stufe 15 ab");

  // Nächste Aufgabe erledigen + Persistenz über Reload
  await page.getByRole("button", { name: "Nächste Aufgabe erledigt" }).click();
  await page.reload({ waitUntil: "networkidle" });
  const stored = await page.evaluate(() => window.__active());
  check(stored.settings?.faction === "horde" && stored.settings?.level === 15, "Einstellungen nach Reload gespeichert");
  check(Object.keys(stored.completedSteps ?? {}).length === 1, "Erledigte Aufgabe nach Reload gespeichert");

  // XP-Tracker: XP hinzufügen mit automatischem Stufenaufstieg, Sitzung
  await page.getByLabel("XP hinzufügen (z. B. Questbelohnung)").fill("20000");
  await page.getByRole("button", { name: "XP hinzufügen" }).click();
  let xpState = await page.evaluate(() => window.__active().settings);
  check(xpState.level === 16 && xpState.xp === 5600, `XP-Tracker steigt automatisch auf (Stufe ${xpState.level}, ${xpState.xp} XP)`);
  await page.getByRole("button", { name: "Sitzung starten" }).click();
  check(await page.getByRole("button", { name: "Sitzung beenden" }).isVisible(), "Sitzung startet");
  await page.getByRole("button", { name: "Sitzung beenden" }).click();
  await page.getByRole("spinbutton", { name: "Aktuelle Stufe" }).first().fill("15");
  xpState = await page.evaluate(() => window.__active().settings);
  check(xpState.level === 15, "Stufe wieder auf 15 gesetzt");

  // Routenfilter
  await page.goto(BASE + "/route", { waitUntil: "networkidle" });
  const before = await page.locator("[id^='h-']").count();
  await page.getByRole("combobox", { name: "Level" }).click();
  await page.getByRole("option", { name: "40–50" }).click();
  const after = await page.locator("[id^='h-']").count();
  check(after > 0 && after < before, `Levelfilter reduziert Abschnitte (${before} → ${after})`);
  await page.getByLabel("Route durchsuchen").fill("Riverglades");
  check(await page.getByText("The Riverglades (neu)").first().isVisible(), "Suche in der Route findet Riverglades");

  // Klassenwechsel behält Fortschritt
  await page.goto(BASE + "/classes?tab=priest", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Als meine Klasse wählen" }).click();
  const afterClass = await page.evaluate(() => window.__active());
  check(afterClass.settings.classId === "priest" && Object.keys(afterClass.completedSteps).length === 1, "Klassenwechsel behält Fortschritt");

  // Globale Suche
  await page.keyboard.press("Control+k");
  await page.getByLabel("Suchbegriff").fill("Sumpfland");
  check(await page.getByRole("listbox").getByText("Sumpfland").first().isVisible(), "Globale Suche liefert Treffer");
  await page.keyboard.press("Escape");

  // Berufe
  await page.goto(BASE + "/professions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Kräuterkunde übernehmen/ }).click();
  const prof = await page.evaluate(() => window.__active().professions.primary);
  check(prof.some((p) => p.id === "herbalism"), "Beruf aus Empfehlung übernommen");

  // Export
  await page.goto(BASE + "/progress", { waitUntil: "networkidle" });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /^Export: / }).first().click()]);
  const exportedPath = await download.path();
  const exported = JSON.parse(readFileSync(exportedPath, "utf8"));
  check(exported.version === 2 && exported.profiles.length === 1 && exported.profiles[0].state.settings.classId === "priest", `Export enthält Zustand (${download.suggestedFilename()})`);

  // Reset mit Bestätigung
  await page.getByRole("button", { name: "Zurücksetzen" }).first().click();
  await page.getByRole("button", { name: "Abbrechen" }).click();
  let s = await page.evaluate(() => window.__active());
  check(s.settings.level === 15, "Abbrechen im Dialog behält Daten");
  await page.getByRole("button", { name: "Zurücksetzen" }).first().click();
  await page.getByRole("button", { name: "Endgültig löschen" }).click();
  s = await page.evaluate(() => window.__active());
  check(s.settings.level === 1 && Object.keys(s.completedSteps).length === 0, "Reset löscht nach Bestätigung");

  // Import
  await page.getByTestId("import-input").setInputFiles(exportedPath);
  await page.getByText(/Import erfolgreich/).waitFor();
  s = await page.evaluate(() => window.__active());
  check(s.settings.level === 15 && s.settings.classId === "priest", "Import stellt Zustand wieder her");

  // Ungültiger Import
  await page.getByTestId("import-input").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{\"version\":7}") });
  await page.getByText(/Nicht unterstützte Version/).waitFor();
  check(true, "Ungültiger Import wird abgelehnt");

  // Mensch-Hexenmeister: Klasse und Volk wählen, klassenspezifische Route
  await page.getByRole("combobox", { name: "Fraktion" }).click();
  await page.getByRole("option", { name: "Allianz" }).click();
  await page.getByRole("combobox", { name: "Klasse" }).click();
  await page.getByRole("option", { name: "Hexenmeister" }).click();
  await page.getByRole("combobox", { name: /Volk/ }).click();
  await page.getByRole("option", { name: "Mensch" }).click();
  s = await page.evaluate(() => window.__active().settings);
  check(s.classId === "warlock" && s.raceId === "human", "Mensch-Hexenmeister auswählbar");
  await page.goto(BASE + "/route", { waitUntil: "networkidle" });
  await page.getByLabel("Route durchsuchen").fill("Leerwandler");
  check(await page.getByText(/Klassenquest für den Leerwandler/).first().isVisible(), "Hexenmeister-Klassenschritt in der Route sichtbar");
  await page.goto(BASE + "/classes?tab=warlock", { waitUntil: "networkidle" });
  check(await page.getByText("Pet tankt, Schaden-über-Zeit-Zauber töten").isVisible(), "Hexenmeister-Klassenseite lädt");

  // Mehrere Charaktere: Mensch Paladin und Mensch Hexenmeister getrennt führen
  await page.goto(BASE + "/progress", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Mensch Paladin", exact: true }).click();
  await page.getByRole("button", { name: "Mensch Hexenmeister", exact: true }).click();
  let app = await page.evaluate(() => window.__app());
  check(app.profiles.length === 4, `Charaktere angelegt (${app.profiles.map((p) => p.name).join(", ")})`);
  s = await page.evaluate(() => window.__active());
  check(s.settings.classId === "warlock" && s.settings.raceId === "human" && s.settings.level === 1, "Neuer Hexenmeister startet frisch auf Stufe 1");
  await page.getByRole("combobox", { name: "Charakter wechseln" }).first().click();
  await page.getByRole("option", { name: "Mensch Paladin" }).click();
  s = await page.evaluate(() => window.__active());
  check(s.settings.classId === "paladin" && Object.keys(s.completedSteps).length === 0, "Wechsel zum Paladin: eigener, leerer Fortschritt");
  await page.getByRole("spinbutton", { name: "Aktuelle Stufe" }).fill("9");
  app = await page.evaluate(() => window.__app());
  const levels = app.profiles.map((p) => `${p.name}:${p.state.settings.level}`).join(" ");
  check(levels.includes("Mensch Paladin:9") && levels.includes("Mensch Hexenmeister:1") && levels.includes("Charakter 1 (2):15"), `Fortschritt bleibt je Charakter getrennt (${levels})`);
  await page.getByRole("button", { name: "Mensch Hexenmeister löschen" }).click();
  await page.getByRole("button", { name: "Endgültig löschen" }).click();
  app = await page.evaluate(() => window.__app());
  check(app.profiles.length === 3 && !app.profiles.some((p) => p.name === "Mensch Hexenmeister"), "Charakter löschen mit Bestätigung");

  // Theme-Umschaltung
  const darkBefore = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  await page.getByRole("button", { name: "Hell/Dunkel umschalten" }).first().click();
  const darkAfter = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  check(darkBefore === true && darkAfter === false, "Dark Mode ist Standard, Light Mode umschaltbar");
  await ctx.close();
}

// Mobil
{
  console.log("Mobil");
  const { ctx, page } = await newPage({ width: 390, height: 844 });
  for (const path of ["/", "/route", "/classes", "/professions", "/progress", "/sources"]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 1, `${path} ohne horizontales Scrollen (Überhang ${overflow}px)`);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/mobile${path === "/" ? "-dashboard" : path.replace("/", "-")}.png`, fullPage: true });
  }
  await page.getByRole("button", { name: "Menü öffnen" }).click();
  await page.getByRole("link", { name: "Levelroute" }).click();
  await page.waitForURL(/\/route/);
  check(page.url().includes("/route"), "Mobile Navigation funktioniert");
  await ctx.close();
}

await browser.close();
const relevant = errors.filter((e) => !e.includes("favicon"));
check(relevant.length === 0, `Keine Konsolen-/Seitenfehler${relevant.length ? `:\n    ${relevant.join("\n    ")}` : ""}`);
console.log(failures ? `\n${failures} Prüfung(en) fehlgeschlagen` : "\nAlle Prüfungen bestanden");
process.exit(failures ? 1 : 0);
