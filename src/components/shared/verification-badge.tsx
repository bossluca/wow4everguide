"use client";

import { ExternalLink } from "lucide-react";
import type { Verification, VerificationStatus } from "@/lib/types";
import { sourceById } from "@/data/sources";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const statusMeta: Record<
  VerificationStatus,
  { label: string; short: string; variant: "success" | "info" | "warning" | "outline"; description: string }
> = {
  confirmed: { label: "Bestätigt", short: "Bestätigt", variant: "success", description: "Durch offizielle Informationen oder belastbare aktuelle Spieldaten belegt." },
  beta: { label: "Beta-getestet", short: "Beta", variant: "info", description: "In einer konkreten Beta-Version überprüft." },
  classic: { label: "Klassische Referenz", short: "Classic", variant: "outline", description: "Aus Classic übernommen, noch nicht für Forever verifiziert." },
  provisional: { label: "Vorläufig", short: "Vorläufig", variant: "warning", description: "Plausible Empfehlung, die noch geprüft werden muss." },
};

export function VerificationBadge({ verification, compact = false }: { verification: Verification; compact?: boolean }) {
  const meta = statusMeta[verification.status];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none" aria-label={`Verifikation: ${meta.label} – Quellen anzeigen`}>
          <Badge variant={meta.variant} className="cursor-pointer">
            {compact ? meta.short : meta.label}
          </Badge>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </DialogTitle>
          <DialogDescription>{meta.description}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {verification.version && (
            <>
              <dt className="text-muted-foreground">Version</dt>
              <dd>{verification.version}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Geprüft am</dt>
          <dd>{verification.checkedAt}</dd>
          {verification.note && (
            <>
              <dt className="text-muted-foreground">Hinweis</dt>
              <dd>{verification.note}</dd>
            </>
          )}
        </dl>
        <div className="space-y-2">
          <p className="text-sm font-medium">Quellen</p>
          <ul className="space-y-1.5 text-sm">
            {verification.sourceIds.map((id) => {
              const src = sourceById.get(id);
              if (!src) return <li key={id} className="text-muted-foreground">Unbekannte Quelle: {id}</li>;
              return (
                <li key={id}>
                  <a href={src.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 hover:underline">
                    <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {src.title} <span className="text-muted-foreground">– {src.publisher}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
