// Prüft die Offline-Version (npm run export) per file:// – ohne Server.
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const executablePath = existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const index = pathToFileURL(resolve("out/index.html")).href;
let failures = 0;
const check = (c, m) => {
  console.log(`  ${c ? "✓" : "✗"} ${m}`);
  if (!c) failures++;
};

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("requestfailed", (r) => errors.push(`failed: ${r.url()}`));

console.log("Offline (file://)");
await page.goto(index);
await page.getByRole("heading", { name: "Dashboard" }).waitFor();
check(true, "Dashboard lädt ohne Server");

for (const [name, h1] of [["Levelroute", /Levelroute/], ["Klassen", /Klassenwahl/], ["Berufe & Gold", /Berufe/], ["Fortschritt", /Fortschritt/], ["Quellen & Lücken", /Quellen/]]) {
  await page.getByRole("link", { name }).first().click();
  await page.getByRole("heading", { level: 1, name: h1 }).waitFor();
  check(page.url().endsWith(".html") || page.url().includes(".html?"), `Navigation → ${name} (${page.url().split("/").pop()})`);
}

await page.getByRole("link", { name: "Fortschritt" }).first().click();
await page.getByRole("spinbutton", { name: "Aktuelle Stufe" }).fill("27");
await page.getByRole("link", { name: "Levelroute" }).first().click();
await page.getByRole("heading", { level: 1, name: /Levelroute/ }).waitFor();
const level = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1")).settings.level);
check(level === 27, "Fortschritt bleibt beim Seitenwechsel gespeichert");

await page.getByRole("link", { name: "Dashboard" }).first().click();
await page.getByRole("heading", { level: 1, name: "Dashboard" }).waitFor();
check(await page.getByText("27 / 60").first().isVisible(), "Dashboard zeigt gespeicherte Stufe");

await page.getByRole("link", { name: "Zur Route" }).click();
await page.getByRole("heading", { level: 1, name: /Levelroute/ }).waitFor();
check(page.url().includes("route.html?faction="), "Dashboard-Link mit Query funktioniert");

await page.keyboard.press("Control+k");
await page.getByLabel("Suchbegriff").fill("Sumpfland");
await page.keyboard.press("Enter");
await page.getByRole("heading", { level: 1, name: /Levelroute/ }).waitFor();
check(page.url().includes("route.html"), "Globale Suche navigiert offline");

await page.reload();
const after = await page.evaluate(() => JSON.parse(localStorage.getItem("wowf-companion:v1")).settings.level);
check(after === 27, "Fortschritt übersteht Neuladen");

await browser.close();
check(errors.length === 0, `Keine Fehler${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
console.log(failures ? `\n${failures} Prüfung(en) fehlgeschlagen` : "\nAlle Offline-Prüfungen bestanden");
process.exit(failures ? 1 : 0);
