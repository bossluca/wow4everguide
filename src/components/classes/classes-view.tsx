"use client";

import { useSearchParams } from "next/navigation";
import { Check, ThumbsUp } from "lucide-react";
import type { ClassGuide, ClassId, Rating } from "@/lib/types";
import { actions, useProgress } from "@/lib/store";
import { classCriteria, classGuides, classRecommendation } from "@/data/classes";
import { races } from "@/data/races";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { ClientOnly } from "@/components/shared/client-only";

const ratingVariant: Record<Rating, "success" | "info" | "warning" | "destructive"> = {
  "sehr gut": "success",
  gut: "info",
  mittel: "warning",
  schwach: "destructive",
};

function RatingBadge({ rating }: { rating: Rating }) {
  return <Badge variant={ratingVariant[rating]}>{rating}</Badge>;
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-1 text-sm">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}

function ClassDetail({ guide, selected }: { guide: ClassGuide; selected: boolean }) {
  const raceNames = races.filter((r) => r.classes.includes(guide.id));
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{guide.name}</CardTitle>
          <CardDescription>{guide.summary}</CardDescription>
          <CardAction>
            {selected ? (
              <Badge variant="success">
                <Check /> Deine Klasse
              </Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={() => actions.setClass(guide.id)}>
                Als meine Klasse wählen
              </Button>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {guide.roles.map((r) => (
              <Badge key={r} variant="secondary">{r}</Badge>
            ))}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Völker: </span>
            {raceNames.map((r) => `${r.name} (${r.faction === "alliance" ? "A" : "H"})`).join(", ")}
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm font-medium">Solo-Leveling: {guide.soloSpec.name}</p>
            <p className="text-sm text-muted-foreground">{guide.soloSpec.why}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Wechsel der Klasse jederzeit möglich – erledigte Stationen, Berufe und Notizen bleiben erhalten.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Talentverteilung nach Meilensteinen</CardTitle>
          <CardDescription>Nur Talente, die in Forever-Quellen belegt sind. Konkrete Punkte bitte im Forever-Talentrechner gegenprüfen.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {guide.talentMilestones.map((m) => (
              <li key={m.levels} className="grid gap-1 sm:grid-cols-[5rem_1fr_auto] sm:gap-3">
                <span className="font-mono text-sm tabular-nums text-muted-foreground">{m.levels}</span>
                <div>
                  <p className="text-sm font-medium">{m.focus}</p>
                  <ul className="text-sm text-muted-foreground">
                    {m.details.map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                </div>
                <VerificationBadge verification={m.verification} />
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wichtige Fähigkeiten & Trainingsstufen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Stufe</TableHead>
                <TableHead>Fähigkeit</TableHead>
                <TableHead className="hidden sm:table-cell">Hinweis</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guide.abilities.map((a) => (
                <TableRow key={a.name}>
                  <TableCell className="font-mono tabular-nums">{a.level ?? "?"}</TableCell>
                  <TableCell>
                    <span className="font-medium">{a.name}</span>
                    {a.foreverChange && <Badge variant="info" className="ml-1.5">Forever</Badge>}
                    <p className="text-xs text-muted-foreground sm:hidden">{a.note}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{a.note}</TableCell>
                  <TableCell className="text-right"><VerificationBadge verification={a.verification} compact /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            <List title="Einfacher Kampfablauf" items={guide.rotation} />
            <List title="Mana & Ressourcen" items={guide.resourceTips} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <List title="Schwierige Gegner" items={guide.hardEnemyTips} />
            <List title="Ausrüstungsprioritäten" items={guide.gearPriorities} />
            {guide.alternative && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Alternative</p>
                <p className="text-sm"><span className="font-medium">{guide.alternative.name}:</span> {guide.alternative.when}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Forever-Änderungen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {guide.foreverChanges.map((c) => (
              <li key={c.text} className="flex items-start justify-between gap-3 text-sm">
                <span>{c.text}</span>
                <VerificationBadge verification={c.verification} compact />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ClassesContent() {
  const state = useProgress();
  const params = useSearchParams();
  const tabParam = params.get("tab");
  const initial: ClassId = tabParam === "paladin" || tabParam === "priest" || tabParam === "druid" ? tabParam : state.settings.classId;
  const order: ClassId[] = ["druid", "paladin", "priest"];
  const ordered = [...classGuides].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return (
    <>
      <PageHeader
        title="Klassenwahl & Leveling-Builds"
        description="Paladin, Priester und Druide im Vergleich für entspanntes Solo-Questing. Bewertungen sind begründete Einschätzungen, keine Messwerte."
      />

      <Card className="border-success/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ThumbsUp className="size-4" /> {classRecommendation.headline}
          </CardTitle>
          <CardAction>
            <VerificationBadge verification={classRecommendation.verification} />
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <List title="Warum" items={classRecommendation.reasons} />
          <List title="Aber beachte" items={classRecommendation.caveats} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vergleich</CardTitle>
          <CardDescription>Tippe auf eine Klasse unten für Details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kriterium</TableHead>
                {ordered.map((c) => (
                  <TableHead key={c.id}>{c.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {classCriteria.map((crit) => (
                <TableRow key={crit.id}>
                  <TableCell className="font-medium">{crit.label}</TableCell>
                  {ordered.map((c) => {
                    const r = c.ratings.find((x) => x.criterionId === crit.id)!;
                    return (
                      <TableCell key={c.id} className="min-w-44">
                        <RatingBadge rating={r.rating} />
                        <p className="mt-1 text-xs text-muted-foreground">{r.text}</p>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Tabs defaultValue={initial} key={initial}>
        <TabsList>
          {ordered.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.name}
              {c.id === state.settings.classId && <Check className="size-3.5" />}
            </TabsTrigger>
          ))}
        </TabsList>
        {ordered.map((c) => (
          <TabsContent key={c.id} value={c.id}>
            <ClassDetail guide={c} selected={c.id === state.settings.classId} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

export function ClassesView() {
  return (
    <ClientOnly fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <ClassesContent />
    </ClientOnly>
  );
}
