// Macht den statischen Export (Ordner "out") per Doppelklick lauffähig (file://):
//  - bettet Schriftdateien als data:-URIs in die CSS ein (file:// blockiert Fonts per CORS)
//  - entfernt Font-Preloads und korrigiert den Favicon-Pfad
//  - schreibt eine Kurzanleitung
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
if (!existsSync(join(OUT, "index.html"))) {
  console.error('Ordner "out" fehlt. Zuerst: npm run export');
  process.exit(1);
}

const cssDir = join(OUT, "_next", "static", "chunks");
let inlined = 0;
for (const file of readdirSync(cssDir).filter((f) => f.endsWith(".css"))) {
  const path = join(cssDir, file);
  const css = readFileSync(path, "utf8");
  const next = css.replace(/url\(\s*["']?([^)"']*\/media\/([^)"']+?\.woff2))["']?\s*\)/g, (match, _full, name) => {
    const fontPath = join(OUT, "_next", "static", "media", name);
    if (!existsSync(fontPath)) return match;
    inlined++;
    return `url(data:font/woff2;base64,${readFileSync(fontPath).toString("base64")})`;
  });
  if (next !== css) writeFileSync(path, next);
}

let pages = 0;
for (const file of readdirSync(OUT).filter((f) => f.endsWith(".html"))) {
  const path = join(OUT, file);
  const html = readFileSync(path, "utf8");
  const fixed = html
    .replace(/<link rel="preload"[^>]*as="font"[^>]*\/>/g, "") // Fonts sind eingebettet
    .replace(/:HL\[\\"[^\\]*\.woff2\\",\\"font\\",\{[^}]*\}\]\\n/g, "")
    .replace(/(["\\])\/favicon\.ico/g, "$1./favicon.ico");
  if (fixed !== html) writeFileSync(path, fixed);
  pages++;
}

writeFileSync(
  join(OUT, "LIESMICH.txt"),
  "Forever Companion – Offline-Version\n\nindex.html per Doppelklick im Browser öffnen. Kein Server, keine Installation.\n" +
    "Den ganzen Ordner behalten bzw. weitergeben (zip). Der Fortschritt wird im Browser gespeichert (pro Browser getrennt);\n" +
    "zum Umziehen auf der Seite 'Fortschritt' exportieren und importieren.\n",
);
console.log(`Offline-Version fertig: ${pages} Seiten, ${inlined} Schriftdateien eingebettet → out/index.html`);
