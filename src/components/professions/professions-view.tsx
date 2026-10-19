"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Coins, Info, Trash2 } from "lucide-react";
import type { ComboGoal, ProfessionId, Rating } from "@/lib/types";
import type { SecondaryProfessionId } from "@/lib/progress";
import { actions, useProgress } from "@/lib/store";
import { currentSection, resourcesForZone, skinningRangeForZone } from "@/lib/derive";
import {
  MAX_SKILL,
  PRIMARY_PROFESSION_LIMIT,
  goldPlan,
  professionById,
  professionCombos,
  professionRecommendation,
  professions,
  recipes,
} from "@/data/professions";
import { resources, resourceById } from "@/data/resources";
import { zones, zoneById } from "@/data/zones";
import { classById } from "@/data/classes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { ClientOnly } from "@/components/shared/client-only";
import { ResourceList } from "./resource-list";

const goalLabels: Record<ComboGoal, string> = {
  gold: "Gold",
  wege: "Wenig Laufwege",
  kosten: "Günstig skillen",
  eigennutzen: "Eigennutzen",
  level60: "Nutzen auf 60",
};
const ratingVariant: Record<Rating, "success" | "info" | "warning" | "destructive"> = {
  "sehr gut": "success",
  gut: "info",
  mittel: "warning",
  schwach: "destructive",
};
const SECONDARY: { id: SecondaryProfessionId; name: string }[] = [
  { id: "firstaid", name: "Erste Hilfe" },
  { id: "cooking", name: "Kochkunst" },
  { id: "fishing", name: "Angeln" },
];
const NONE = "__none";

function SkillInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <Input
      type="number"
      min={0}
      max={MAX_SKILL}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-8 w-20 text-center tabular-nums"
      aria-label={label}
    />
  );
}

function MyProfessions() {
  const state = useProgress();
  const primary = state.professions.primary;
  const available = professions.filter((p) => p.kind !== "secondary" && !primary.some((x) => x.id === p.id));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Meine Berufe</CardTitle>
        <CardDescription>Zwei Hauptberufe plus Nebenberufe. Skillstand wird lokal gespeichert.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {primary.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3">
              <span className="w-36 font-medium">{professionById.get(p.id)?.name}</span>
              <SkillInput value={p.skill} onChange={(n) => actions.setPrimarySkill(p.id, n)} label={`Skill ${professionById.get(p.id)?.name}`} />
              <Progress value={(p.skill / MAX_SKILL) * 100} className="min-w-24 flex-1" aria-label="Skill-Fortschritt" />
              <Button variant="ghost" size="icon-sm" onClick={() => actions.removePrimaryProfession(p.id)} aria-label="Beruf entfernen">
                <Trash2 />
              </Button>
            </div>
          ))}
          {primary.length < PRIMARY_PROFESSION_LIMIT && (
            <Select value={NONE} onValueChange={(v) => v !== NONE && actions.addPrimaryProfession(v as ProfessionId)}>
              <SelectTrigger className="w-full sm:w-72" aria-label="Hauptberuf hinzufügen">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>+ Hauptberuf hinzufügen ({primary.length}/{PRIMARY_PROFESSION_LIMIT})</SelectItem>
                {available.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.kind === "gathering" ? "Sammeln" : "Herstellen"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {SECONDARY.map((s) => {
            const val = state.professions.secondary[s.id];
            return (
              <div key={s.id} className="space-y-1.5 rounded-md border p-2.5">
                <Label className="justify-between">
                  {s.name}
                  <Checkbox
                    checked={val !== undefined}
                    onCheckedChange={(c) => actions.setSecondarySkill(s.id, c === true ? 1 : null)}
                    aria-label={`${s.name} gelernt`}
                  />
                </Label>
                {val !== undefined ? (
                  <SkillInput value={val} onChange={(n) => actions.setSecondarySkill(s.id, n)} label={`Skill ${s.name}`} />
                ) : (
                  <p className="text-xs text-muted-foreground">Nicht gelernt</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceFinder({ initial }: { initial: string | null }) {
  const [resId, setResId] = useState(initial && resourceById.has(initial) ? initial : "iron");
  const res = resourceById.get(resId)!;
  const found = zones.filter((z) => z.resourceIds.includes(resId));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ressourcen-Finder</CardTitle>
        <CardDescription>Wo liegt was? (Classic-Referenz, Forever-Fundorte können abweichen.)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={resId} onValueChange={setResId}>
          <SelectTrigger className="w-full sm:w-72" aria-label="Ressource wählen">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {resources.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name} ({r.skill || "?"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">Skill {res.skill || "?"}</Badge>
          <Badge variant="outline">Nachfrage {res.demand}</Badge>
          <VerificationBadge verification={res.verification} />
        </div>
        {res.note && <p className="text-sm text-muted-foreground">{res.note}</p>}
        <div className="flex flex-wrap gap-1.5">
          {found.length === 0 && <span className="text-sm text-muted-foreground">Keine Fundorte dokumentiert.</span>}
          {found.map((z) => (
            <Badge key={z.id} variant="secondary">
              {z.name} ({z.levelMin}–{z.levelMax})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfessionsContent() {
  const state = useProgress();
  const params = useSearchParams();
  const cur = currentSection(state);
  const [zoneId, setZoneId] = useState(cur?.zoneId ?? "elwynn");
  const [recipeFilter, setRecipeFilter] = useState<string>("all");
  const { classId, level } = state.settings;
  const rec = professionRecommendation[classId];
  const recCombo = professionCombos.find((c) => c.id === rec.comboId)!;
  const bracket = goldPlan.find((g) => level >= g.levelMin && level < g.levelMax) ?? goldPlan[goldPlan.length - 1];
  const filteredRecipes = recipeFilter === "all" ? recipes : recipes.filter((r) => r.professionId === recipeFilter);

  return (
    <>
      <PageHeader
        title="Berufe & Gold"
        description="Unkompliziert Gold verdienen, ohne die Levelroute zu verlassen. Empfehlungen pro Klasse, Sammelressourcen pro Gebiet und ein Materialplan je Levelabschnitt."
      />

      <Alert variant="info">
        <Info />
        <AlertTitle>Keine Auktionshauspreise</AlertTitle>
        <AlertDescription>
          WoW Forever ist noch nicht veröffentlicht – es gibt keine belastbaren Marktpreise. Alle Goldhinweise sind allgemeine Einschätzungen. Es werden keine festen Gewinne versprochen.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-success/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="size-4" /> Empfehlung für {classById.get(classId)?.name}
            </CardTitle>
            <CardAction>
              <VerificationBadge verification={recCombo.verification} />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-base font-medium">{recCombo.title}</p>
            <p className="text-muted-foreground">{rec.why}</p>
            <p>
              <span className="font-medium">Auf Stufe 60: </span>
              {rec.at60}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {recCombo.professions.map((id) =>
                state.professions.primary.some((p) => p.id === id) ? (
                  <Badge key={id} variant="success">{professionById.get(id)?.name} gelernt</Badge>
                ) : (
                  <Button key={id} size="sm" variant="outline" onClick={() => actions.addPrimaryProfession(id)} disabled={state.professions.primary.length >= PRIMARY_PROFESSION_LIMIT}>
                    {professionById.get(id)?.name} übernehmen
                  </Button>
                ),
              )}
            </div>
          </CardContent>
        </Card>
        <MyProfessions />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kombinationen im Vergleich</CardTitle>
          <CardDescription>Kandidaten, keine festgelegten Gewinner. Bewertung nach deinen fünf Zielen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kombination</TableHead>
                {(Object.keys(goalLabels) as ComboGoal[]).map((g) => (
                  <TableHead key={g}>{goalLabels[g]}</TableHead>
                ))}
                <TableHead>Passt zu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionCombos.map((c) => (
                <TableRow key={c.id} className={c.id === rec.comboId ? "bg-success/5" : undefined}>
                  <TableCell className="min-w-56">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.verdict}</p>
                  </TableCell>
                  {(Object.keys(goalLabels) as ComboGoal[]).map((g) => (
                    <TableCell key={g}>
                      <Badge variant={ratingVariant[c.scores[g]]}>{c.scores[g]}</Badge>
                    </TableCell>
                  ))}
                  <TableCell className="whitespace-nowrap text-xs">{c.bestFor.map((id) => classById.get(id)?.name).join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {professionCombos.map((c) => (
              <div key={c.id} className="space-y-2 rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{c.title}</p>
                  <VerificationBadge verification={c.verification} compact />
                </div>
                <ul className="space-y-0.5">
                  {c.pros.map((p) => (
                    <li key={p} className="text-success">+ <span className="text-foreground">{p}</span></li>
                  ))}
                  {c.cons.map((p) => (
                    <li key={p} className="text-destructive">− <span className="text-foreground">{p}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sammeln im Gebiet</CardTitle>
            <CardDescription>Benötigter Skill und ob sich ein kleiner Umweg lohnt.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger className="w-full sm:w-72" aria-label="Gebiet wählen">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name} ({z.levelMin}–{z.levelMax})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ResourceList items={resourcesForZone(zoneId, state)} skinning={skinningRangeForZone(zoneId)} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Datenstand Gebiet: <VerificationBadge verification={zoneById.get(zoneId)!.verification} compact />
            </div>
          </CardContent>
        </Card>
        <ResourceFinder initial={params.get("resource")} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gold- & Materialplan je Levelabschnitt</CardTitle>
          <CardDescription>Aktueller Abschnitt ist vorausgewählt.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={bracket.id} key={bracket.id}>
            <TabsList>
              {goldPlan.map((g) => (
                <TabsTrigger key={g.id} value={g.id}>
                  {g.levelMin}–{g.levelMax}
                </TabsTrigger>
              ))}
            </TabsList>
            {goldPlan.map((g) => (
              <TabsContent key={g.id} value={g.id} className="space-y-3">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(
                    [
                      ["Mitnehmen", g.gather],
                      ["Verkaufen", g.sell],
                      ["Aufheben", g.keep],
                      ["Selbst herstellen", g.craft],
                      ["Lehrer / Trainer", g.trainer],
                      ["Passende Gebiete", g.fits],
                    ] as const
                  ).map(([title, items]) => (
                    <div key={title}>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
                      <ul className="space-y-0.5 text-sm">
                        {items.map((i) => (
                          <li key={i}>• {i}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <VerificationBadge verification={g.verification} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alle Berufe</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {professions.map((p) => (
            <div key={p.id} className="space-y-1.5 rounded-lg border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{p.name}</p>
                <Badge variant="secondary">{p.kind === "gathering" ? "Sammeln" : p.kind === "crafting" ? "Herstellen" : "Nebenberuf"}</Badge>
              </div>
              <p className="text-muted-foreground">{p.summary}</p>
              <p><span className="font-medium">Leveln:</span> {p.levelingValue}</p>
              <p><span className="font-medium">Gold:</span> {p.goldValue}</p>
              {p.campObject && <p><span className="font-medium">Lager:</span> {p.campObject}</p>}
              {p.foreverChanges.length > 0 && (
                <ul className="space-y-1 border-t pt-1.5">
                  {p.foreverChanges.map((c) => (
                    <li key={c.text} className="flex items-start justify-between gap-2">
                      <span>{c.text}</span>
                      <VerificationBadge verification={c.verification} compact />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nützliche Rezepte</CardTitle>
          <CardDescription>Auswahl für Eigenbedarf und einfaches Skillen.</CardDescription>
          <CardAction>
            <Select value={recipeFilter} onValueChange={setRecipeFilter}>
              <SelectTrigger size="sm" aria-label="Rezepte filtern">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Berufe</SelectItem>
                {[...new Set(recipes.map((r) => r.professionId))].map((id) => (
                  <SelectItem key={id} value={id}>{professionById.get(id)?.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rezept</TableHead>
                <TableHead>Beruf</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead className="hidden md:table-cell">Material</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecipes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium">{r.name}</p>
                    {r.note && <p className="text-xs text-muted-foreground">{r.note}</p>}
                  </TableCell>
                  <TableCell>{professionById.get(r.professionId)?.name}</TableCell>
                  <TableCell className="font-mono tabular-nums">{r.skill || "?"}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{r.reagents}</TableCell>
                  <TableCell className="text-right"><VerificationBadge verification={r.verification} compact /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export function ProfessionsView() {
  return (
    <ClientOnly fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <ProfessionsContent />
    </ClientOnly>
  );
}
