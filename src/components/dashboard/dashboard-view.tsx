"use client";

import Link from "next/link";
import { ArrowRight, CheckCheck, Compass, Hammer, Lightbulb, MapPin, Route as RouteIcon } from "lucide-react";
import { actions, useProgress } from "@/lib/store";
import {
  currentSection,
  levelPercent,
  nextSection,
  nextTasks,
  resourcesForZone,
  routeTotals,
  sectionProgress,
  skinningRangeForZone,
} from "@/lib/derive";
import { classById } from "@/data/classes";
import { zoneById } from "@/data/zones";
import { professionById, professionRecommendation, professionCombos } from "@/data/professions";
import { hintsFor } from "@/data/hints";
import { raceById } from "@/data/races";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { FactionBadge } from "@/components/shared/faction-badge";
import { LevelRange } from "@/components/shared/level-range";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { ZoneStatusBadge } from "@/components/shared/zone-status-badge";
import { CharacterForm, LevelStepper } from "@/components/shared/character-form";
import { StepItem } from "@/components/route/step-item";
import { ResourceList } from "@/components/professions/resource-list";
import { ClientOnly } from "@/components/shared/client-only";

function DashboardContent() {
  const state = useProgress();
  const { level, classId, faction, raceId } = state.settings;
  const cur = currentSection(state);
  const next = nextSection(state, cur);
  const tasks = nextTasks(state, 6);
  const totals = routeTotals(state);
  const cls = classById.get(classId)!;
  const curZone = cur ? zoneById.get(cur.zoneId) : undefined;
  const nextZone = next ? zoneById.get(next.zoneId) : undefined;
  const curProgress = cur ? sectionProgress(cur, state.completedSteps, classId) : undefined;
  const hints = hintsFor(level, classId);
  const isFresh = state.updatedAt.startsWith("1970");
  const rec = professionRecommendation[classId];
  const recCombo = professionCombos.find((c) => c.id === rec.comboId);
  const firstTask = tasks[0];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Dein Überblick für die aktuelle Levelphase. Alles leitet sich aus Stufe, Gebiet und erledigten Stationen ab."
        actions={
          firstTask && (
            <Button onClick={() => actions.toggleStep(firstTask.step.id, true)}>
              <CheckCheck /> Nächste Aufgabe erledigt
            </Button>
          )
        }
      />

      {isFresh && (
        <Card className="border-info/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="size-4" /> Charakter einrichten
            </CardTitle>
            <CardDescription>
              Wähle Fraktion, Klasse und – falls schon bekannt – Volk. Alles bleibt später änderbar, ohne Fortschritt zu verlieren.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CharacterForm showZone={false} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Stufe</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{level} / 60</CardTitle>
            <CardAction>
              <LevelStepper />
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-1">
            <Progress value={levelPercent(level)} aria-label="Fortschritt bis 60" />
            <p className="text-xs text-muted-foreground">{levelPercent(level)} % bis Stufe 60</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Routenfortschritt</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{totals.percent} %</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Progress value={totals.percent} aria-label="Routenfortschritt" />
            <p className="text-xs text-muted-foreground">
              {totals.done} von {totals.total} Stationen erledigt
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Charakter</CardDescription>
            <CardTitle className="text-2xl">{cls.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            <FactionBadge faction={faction} />
            <Badge variant="secondary">{cls.soloSpec.name.split(" (")[0].split(" –")[0]}</Badge>
            {raceId && <Badge variant="outline">{raceById.get(raceId)?.name}</Badge>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Berufe</CardDescription>
            <CardTitle className="text-base">
              {state.professions.primary.length
                ? state.professions.primary.map((p) => `${professionById.get(p.id)?.name} ${p.skill}`).join(" · ")
                : "Noch keine gewählt"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/professions" className="text-xs text-muted-foreground hover:underline">
              Empfehlung: {recCombo?.title} →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <MapPin className="size-3.5" /> Aktuelles Gebiet
            </CardDescription>
            <CardTitle className="text-lg">{cur ? `${curZone?.name} – ${cur.title}` : "Keine Route"}</CardTitle>
            {cur && (
              <CardAction className="flex flex-wrap justify-end gap-1.5">
                <LevelRange min={cur.levelMin} max={cur.levelMax} />
                {curZone && <ZoneStatusBadge status={curZone.foreverStatus} />}
              </CardAction>
            )}
          </CardHeader>
          {cur && curProgress && (
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{cur.summary}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Abschnitt</span>
                  <span>
                    {curProgress.done}/{curProgress.total} · wichtig {curProgress.importantDone}/{curProgress.importantTotal}
                  </span>
                </div>
                <Progress value={curProgress.percent} aria-label="Fortschritt im Abschnitt" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Quest-Hubs</p>
                  <ul className="space-y-0.5 text-sm">
                    {cur.hubs.map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Weiterziehen, wenn</p>
                  <ul className="space-y-0.5 text-sm">
                    {cur.leaveWhen.map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Danach: </span>
                  {next && nextZone ? (
                    <span className="font-medium">
                      {nextZone.name} ({next.levelMin}–{next.levelMax})
                    </span>
                  ) : (
                    <span className="font-medium">Stufe 60 – Hyjal & Endgame</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <VerificationBadge verification={cur.verification} />
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/route?faction=${faction}#${cur.id}`}>
                      <RouteIcon /> Zur Route
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Nächste Aufgaben</CardTitle>
            <CardDescription>Abhaken speichert sofort lokal.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Alles erledigt – passe Stufe oder Gebiet an.</p>
            ) : (
              <ul className="-mx-2">
                {tasks.flatMap(({ step, section }, i) => [
                  ...(i === 0 || tasks[i - 1].section.id !== section.id
                    ? [
                        <li key={`h-${section.id}`} role="presentation" className="px-2 pt-1 text-xs font-medium text-muted-foreground">
                          {section.title}
                        </li>,
                      ]
                    : []),
                  <StepItem key={step.id} step={step} done={false} showQuests={false} />,
                ])}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hammer className="size-4" /> Sammeln in {curZone?.name ?? "diesem Gebiet"}
            </CardTitle>
            <CardDescription>Abgeglichen mit deinen Berufsskills.</CardDescription>
          </CardHeader>
          <CardContent>
            {cur && <ResourceList items={resourcesForZone(cur.zoneId, state)} skinning={skinningRangeForZone(cur.zoneId)} compact />}
            {cur && cur.professionNotes.length > 0 && (
              <ul className="mt-3 space-y-0.5 text-sm text-muted-foreground">
                {cur.professionNotes.map((n) => (
                  <li key={n}>• {n}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4" /> Hinweise für Stufe {level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {hints.map((h) => (
                <li key={h.text} className="flex items-start justify-between gap-3 text-sm">
                  <span>{h.text}</span>
                  <VerificationBadge verification={h.verification} compact />
                </li>
              ))}
              {cur?.warnings.map((w) => (
                <li key={w} className="text-sm text-warning">
                  ⚠ {w}
                </li>
              ))}
            </ul>
            <Button asChild variant="link" className="mt-2 px-0">
              <Link href={`/classes?tab=${classId}`}>
                Spielweise {cls.name} <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}

export function DashboardView() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </ClientOnly>
  );
}
