// Mini-Server für den Ordner "out" (ohne Abhängigkeiten) – Alternative zum Doppelklick,
// z. B. für Firefox, das localStorage zwischen file://-Seiten nicht teilt.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "out");
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    let rel = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    if (rel.endsWith("/") || rel === "") rel = join(rel, "index.html");
    let file = join(ROOT, rel);
    if (!file.startsWith(ROOT)) throw new Error("outside");
    if (!extname(file)) file += ".html";
    await stat(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Nicht gefunden");
  }
}).listen(PORT, "0.0.0.0", () => console.log(`Forever Companion läuft auf http://localhost:${PORT}`));
