"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { search } from "@/lib/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SearchDialog({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const results = useMemo(() => search(query), [query]);

  useEffect(() => {
    if (compact) return; // Tastenkürzel nur einmal registrieren (Desktop-Instanz)
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [compact]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      {compact ? (
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Suche öffnen">
          <Search />
        </Button>
      ) : (
        <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => setOpen(true)}>
          <Search />
          Suchen…
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">Strg K</kbd>
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[15%] translate-y-0 gap-3 p-4">
          <DialogHeader>
            <DialogTitle>Suche</DialogTitle>
            <DialogDescription>Gebiete, Quests, Dungeons, Klassen, Berufe und Ressourcen.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="z. B. Sumpfland, Mithril, Primal Bite…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].href);
            }}
            aria-label="Suchbegriff"
          />
          <ul className="max-h-80 space-y-0.5 overflow-y-auto" role="listbox" aria-label="Suchergebnisse">
            {query && results.length === 0 && <li className="p-2 text-sm text-muted-foreground">Keine Treffer.</li>}
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                >
                  <Badge variant="secondary" className="w-20 justify-center">
                    {r.kind}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate font-medium">{r.title}</span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{r.subtitle}</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
