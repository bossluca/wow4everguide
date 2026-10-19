import { ExternalLink } from "lucide-react";
import type { SourceKind } from "@/lib/types";
import { sources } from "@/data/sources";
import { dataGaps, foreverFacts } from "@/data/gaps";
import { DATA_CHECKED_AT, BETA_BUILD } from "@/data/verify";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { VerificationBadge, statusMeta } from "@/components/shared/verification-badge";

const kindLabel: Record<SourceKind, string> = {
  official: "Offiziell",
  guide: "Guide",
  datamine: "Datenbank",
  community: "Community",
  "classic-reference": "Classic-Referenz",
};

const impactVariant = { hoch: "destructive", mittel: "warning", niedrig: "secondary" } as const;

export function SourcesView() {
  return (
    <>
      <PageHeader
        title="Quellen & Datenlücken"
        description={`Recherchestand ${DATA_CHECKED_AT}, Beta-Bezug ${BETA_BUILD}. Bestätigte Fakten sind von Einschätzungen getrennt – offene Punkte sind bewusst sichtbar.`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verifikationsstatus</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(statusMeta).map(([key, m]) => (
            <div key={key} className="space-y-1.5 rounded-lg border p-3">
              <Badge variant={m.variant}>{m.label}</Badge>
              <p className="text-sm text-muted-foreground">{m.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Was zu WoW Forever feststeht</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {foreverFacts.map((f) => (
              <li key={f.text} className="flex items-start justify-between gap-3 text-sm">
                <span>{f.text}</span>
                <VerificationBadge verification={f.verification} compact />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offene Datenlücken</CardTitle>
          <CardDescription>Diese Inhalte wurden nicht erfunden, sondern als Lücke markiert.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bereich</TableHead>
                <TableHead>Lücke</TableHead>
                <TableHead className="text-right">Auswirkung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataGaps.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium whitespace-nowrap">{g.area}</TableCell>
                  <TableCell className="min-w-64 text-muted-foreground">{g.text}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={impactVariant[g.impact]}>{g.impact}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quellenübersicht</CardTitle>
          <CardDescription>Titel, URL, Thema und letztes Prüfdatum.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Art</TableHead>
                <TableHead className="hidden md:table-cell">Themen</TableHead>
                <TableHead className="text-right">Geprüft</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="min-w-64">
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 font-medium hover:underline">
                      <ExternalLink className="mt-0.5 size-3.5 shrink-0" />
                      {s.title}
                    </a>
                    <p className="text-xs text-muted-foreground">{s.publisher}</p>
                    {s.accessNote && <p className="text-xs text-muted-foreground italic">{s.accessNote}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.kind === "official" ? "success" : s.kind === "classic-reference" ? "outline" : "secondary"}>{kindLabel[s.kind]}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{s.topics.join(", ")}</TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">{s.checkedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
