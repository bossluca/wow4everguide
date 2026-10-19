"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import type { ClassId, Faction, RouteSection } from "@/lib/types";
import { actions, useProgress } from "@/lib/store";
import { sectionProgress, stepsForClass, currentSection } from "@/lib/derive";
import { routes } from "@/data/route";
import { zoneById } from "@/data/zones";
import { dungeonById } from "@/data/dungeons";
import { questById } from "@/data/quests";
import { raceById } from "@/data/races";
import { classGuides } from "@/data/classes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageHeader } from "@/components/shared/page-header";
import { FactionBadge } from "@/components/shared/faction-badge";
import { LevelRange } from "@/components/shared/level-range";
import { VerificationBadge } from "@/components/shared/verification-badge";
import { ZoneStatusBadge } from "@/components/shared/zone-status-badge";
import { ClientOnly } from "@/components/shared/client-only";
import { StepItem } from "./step-item";

const ALL = "__all";
const LEVEL_BANDS = [
  { id: ALL, label: "Alle Stufen", min: 1, max: 60 },
  { id: "1-10", label: "1–10", min: 1, max: 10 },
  { id: "10-20", label: "10–20", min: 10, max: 20 },
  { id: "20-30", label: "20–30", min: 20, max: 30 },
  { id: "30-40", label: "30–40", min: 30, max: 40 },
  { id: "40-50", label: "40–50", min: 40, max: 50 },
  { id: "50-60", label: "50–60", min: 50, max: 60 },
];

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-0.5 text-sm">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}

function SectionCard({
  section,
  classId,
  isCurrent,
  defaultOpen,
}: {
  section: RouteSection;
  classId: ClassId;
  isCurrent: boolean;
  defaultOpen: boolean;
}) {
  const state = useProgress();
  const zone = zoneById.get(section.zoneId);
  const progress = sectionProgress(section, state.completedSteps, classId);
  const steps = stepsForClass(section, classId);
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card id={section.id} className={cn("scroll-mt-20", isCurrent && "border-primary/50 ring-1 ring-primary/20")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader>
          <CardDescription className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs">#{section.order}</span>
            <LevelRange min={section.levelMin} max={section.levelMax} />
            <FactionBadge faction={section.faction} />
            {zone && <ZoneStatusBadge status={zone.foreverStatus} />}
            {isCurrent && <Badge>Aktuell</Badge>}
            {section.startRaces && (
              <Badge variant="outline">Start: {section.startRaces.map((r) => raceById.get(r)?.name ?? r).join(", ")}</Badge>
            )}
          </CardDescription>
          <CardTitle className="text-base">
            {zone?.name} – {section.title}
          </CardTitle>
          <CardAction>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={open ? "Abschnitt einklappen" : "Abschnitt ausklappen"}>
                <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{section.summary}</p>
          <div className="flex items-center gap-3">
            <Progress value={progress.percent} className="flex-1" aria-label={`Fortschritt ${section.title}`} />
            <span className="w-14 text-right font-mono text-xs tabular-nums text-muted-foreground">
              {progress.done}/{progress.total}
            </span>
          </div>
          <CollapsibleContent className="space-y-4 pt-1">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Stationen</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => actions.setSteps(steps.map((s) => s.id), true)}>
                    Alle erledigt
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => actions.setSteps(steps.map((s) => s.id), false)}>
                    Zurücksetzen
                  </Button>
                </div>
              </div>
              <ol className="-mx-2">
                {steps.map((st) => (
                  <StepItem key={st.id} step={st} done={st.id in state.completedSteps} />
                ))}
              </ol>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailList title="Quest-Hubs" items={section.hubs} />
              <DetailList
                title="Wichtige Quests"
                items={section.keyQuestIds.map((id) => {
                  const q = questById.get(id);
                  return q ? `${q.name}${q.level ? ` (~${q.level})` : ""}${q.note ? ` – ${q.note}` : ""}` : id;
                })}
              />
              <DetailList
                title="Optionale Dungeons"
                items={section.optionalDungeonIds.map((id) => {
                  const d = dungeonById.get(id);
                  return d ? `${d.name} (${d.levelMin}–${d.levelMax})${d.isNew ? " · neu" : ""} – ${d.valueNote}` : id;
                })}
              />
              <DetailList title="Flugpunkte & Reisewege" items={section.travel} />
              <DetailList title="Klassentrainer" items={section.trainers} />
              <DetailList title="Berufe & Ressourcen" items={section.professionNotes} />
              <DetailList title="Achtung" items={section.warnings} />
              <DetailList title="Weiterziehen, wenn" items={section.leaveWhen} />
            </div>
            {section.gaps && section.gaps.length > 0 && (
              <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                <p className="mb-1 font-medium">Datenlücken</p>
                <ul className="space-y-0.5 text-muted-foreground">
                  {section.gaps.map((g) => (
                    <li key={g}>• {g}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Verifikation:</span>
              <VerificationBadge verification={section.verification} />
              {section.verification.note && <span>{section.verification.note}</span>}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

function RouteContent({ params }: { params: URLSearchParams }) {
  const state = useProgress();
  const paramFaction = params.get("faction");
  const paramZone = params.get("zone");

  const [faction, setFaction] = useState<Faction>(
    paramFaction === "alliance" || paramFaction === "horde" ? paramFaction : state.settings.faction,
  );
  const [classId, setClassId] = useState<ClassId>(state.settings.classId);
  const [band, setBand] = useState(ALL);
  const [zoneFilter, setZoneFilter] = useState(paramZone && zoneById.has(paramZone) ? paramZone : ALL);
  const [query, setQuery] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyImportant, setOnlyImportant] = useState(false);
  const [onlyMyRace, setOnlyMyRace] = useState(true);

  const raceId = state.settings.raceId;
  const raceMatches = raceId && raceById.get(raceId)?.faction === faction;
  const cur = currentSection(state);

  const allForFaction = routes[faction];
  const zonesInRoute = useMemo(
    () => [...new Set(allForFaction.map((s) => s.zoneId))].map((id) => zoneById.get(id)!).filter(Boolean),
    [allForFaction],
  );

  const sections = useMemo(() => {
    const b = LEVEL_BANDS.find((x) => x.id === band)!;
    const q = norm(query.trim());
    return allForFaction.filter((s) => {
      if (onlyMyRace && raceMatches && s.startRaces && !s.startRaces.includes(raceId!)) return false;
      if (s.levelMax < b.min || s.levelMin > b.max) return false;
      if (zoneFilter !== ALL && s.zoneId !== zoneFilter) return false;
      const steps = stepsForClass(s, classId);
      if (onlyOpen && steps.every((st) => st.id in state.completedSteps)) return false;
      if (onlyImportant && !steps.some((st) => st.important && !(st.id in state.completedSteps))) return false;
      if (q) {
        const hay = norm(
          [s.title, s.summary, zoneById.get(s.zoneId)?.name ?? "", ...s.hubs, ...s.steps.map((x) => x.text), ...s.keyQuestIds.map((id) => questById.get(id)?.name ?? "")].join(" "),
        );
        if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
      }
      return true;
    });
  }, [allForFaction, band, zoneFilter, query, onlyOpen, onlyImportant, onlyMyRace, raceMatches, raceId, classId, state.completedSteps]);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, []);

  const filtersActive = band !== ALL || zoneFilter !== ALL || query || onlyOpen || onlyImportant;

  return (
    <>
      <PageHeader
        title="Levelroute 1–60"
        description="Eine klare Hauptroute pro Fraktion – optimiert auf entspanntes Solo-Questing mit wenig Reisewegen. Optionale Abweichungen sind markiert."
      />

      <Card>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="rf-faction">Fraktion</Label>
              <Select value={faction} onValueChange={(v) => { setFaction(v as Faction); setZoneFilter(ALL); }}>
                <SelectTrigger id="rf-faction" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alliance">Allianz</SelectItem>
                  <SelectItem value="horde">Horde</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rf-class">Klasse</Label>
              <Select value={classId} onValueChange={(v) => setClassId(v as ClassId)}>
                <SelectTrigger id="rf-class" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classGuides.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rf-level">Level</Label>
              <Select value={band} onValueChange={setBand}>
                <SelectTrigger id="rf-level" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVEL_BANDS.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rf-zone">Gebiet</Label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger id="rf-zone" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle Gebiete</SelectItem>
                  {zonesInRoute.map((z) => (
                    <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Route durchsuchen (Hub, Quest, Station)…" className="pl-8" aria-label="Route durchsuchen" />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><Switch checked={onlyOpen} onCheckedChange={setOnlyOpen} /> Nur offene</label>
              <label className="flex items-center gap-2"><Switch checked={onlyImportant} onCheckedChange={setOnlyImportant} /> Nur wichtige</label>
              {raceMatches && (
                <label className="flex items-center gap-2"><Switch checked={onlyMyRace} onCheckedChange={setOnlyMyRace} /> Nur mein Startzweig</label>
              )}
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={() => { setBand(ALL); setZoneFilter(ALL); setQuery(""); setOnlyOpen(false); setOnlyImportant(false); }}>
                  <X /> Filter zurücksetzen
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {sections.length} Abschnitt{sections.length === 1 ? "" : "e"} · Questnamen im englischen Original für die Wowhead-Suche · Klick auf einen Status zeigt Quelle und Version.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sections.length === 0 && <p className="text-sm text-muted-foreground">Keine Abschnitte für diese Filter.</p>}
        {sections.map((s) => (
          <SectionCard
            key={`${s.id}-${classId}`}
            section={s}
            classId={classId}
            isCurrent={cur?.id === s.id}
            defaultOpen={cur?.id === s.id || zoneFilter !== ALL || Boolean(query)}
          />
        ))}
      </div>
    </>
  );
}

export function RouteView() {
  const params = useSearchParams();
  return (
    <ClientOnly fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      {/* Neuer Schlüssel bei geänderten URL-Parametern setzt die Filter auf die Link-Vorgaben. */}
      <RouteContent key={params.toString()} params={new URLSearchParams(params.toString())} />
    </ClientOnly>
  );
}
