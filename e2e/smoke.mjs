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
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1") ?? "{}"));
  check(stored.settings?.faction === "horde" && stored.settings?.level === 15, "Einstellungen nach Reload gespeichert");
  check(Object.keys(stored.completedSteps ?? {}).length === 1, "Erledigte Aufgabe nach Reload gespeichert");

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
  const afterClass = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1")));
  check(afterClass.settings.classId === "priest" && Object.keys(afterClass.completedSteps).length === 1, "Klassenwechsel behält Fortschritt");

  // Globale Suche
  await page.keyboard.press("Control+k");
  await page.getByLabel("Suchbegriff").fill("Sumpfland");
  check(await page.getByRole("listbox").getByText("Sumpfland").first().isVisible(), "Globale Suche liefert Treffer");
  await page.keyboard.press("Escape");

  // Berufe
  await page.goto(BASE + "/professions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Kräuterkunde übernehmen/ }).click();
  const prof = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1")).professions.primary);
  check(prof.some((p) => p.id === "herbalism"), "Beruf aus Empfehlung übernommen");

  // Export
  await page.goto(BASE + "/progress", { waitUntil: "networkidle" });
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export (JSON)" }).click()]);
  const exportedPath = await download.path();
  const exported = JSON.parse(readFileSync(exportedPath, "utf8"));
  check(exported.version === 1 && exported.settings.classId === "priest", `Export enthält Zustand (${download.suggestedFilename()})`);

  // Reset mit Bestätigung
  await page.getByRole("button", { name: "Zurücksetzen" }).first().click();
  await page.getByRole("button", { name: "Abbrechen" }).click();
  let s = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1")));
  check(s.settings.level === 15, "Abbrechen im Dialog behält Daten");
  await page.getByRole("button", { name: "Zurücksetzen" }).first().click();
  await page.getByRole("button", { name: "Endgültig löschen" }).click();
  s = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1")));
  check(s.settings.level === 1 && Object.keys(s.completedSteps).length === 0, "Reset löscht nach Bestätigung");

  // Import
  await page.getByTestId("import-input").setInputFiles(exportedPath);
  await page.getByText(/Import erfolgreich/).waitFor();
  s = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1")));
  check(s.settings.level === 15 && s.settings.classId === "priest", "Import stellt Zustand wieder her");

  // Ungültiger Import
  await page.getByTestId("import-input").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{\"version\":7}") });
  check(await page.getByText(/Nicht unterstützte Version/).isVisible(), "Ungültiger Import wird abgelehnt");

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
