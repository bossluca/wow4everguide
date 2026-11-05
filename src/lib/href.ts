/**
 * Links für die normale App und die Offline-Version (npm run export).
 * Offline liegen die Seiten als flache Dateien (route.html), damit sie per Doppelklick
 * (file://) funktionieren – dort gibt es weder Server noch absolute Pfade.
 */
export const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/** "/route?faction=horde#h-barrens" → "./route.html?faction=horde#h-barrens" (nur offline). */
export function hrefFor(path: string): string {
  if (!STATIC_EXPORT || !path.startsWith("/")) return path;
  const match = /^\/([^?#]*)(.*)$/.exec(path);
  const page = match?.[1] || "index";
  return `./${page}.html${match?.[2] ?? ""}`;
}

/** Normalisiert den Pfad für die Navigation: "/x/out/route.html" und "/route/" → "/route". */
export function normalizePath(pathname: string): string {
  const last = pathname.replace(/\/+$/, "").split("/").pop() ?? "";
  const page = last.replace(/\.html$/, "");
  if (STATIC_EXPORT) return page && page !== "index" ? `/${page}` : "/";
  return pathname;
}

/** Wechselt die Seite – offline per echtem Seitenwechsel, sonst vom Router übernommen. */
export function hardNavigate(path: string) {
  window.location.assign(hrefFor(path));
}
