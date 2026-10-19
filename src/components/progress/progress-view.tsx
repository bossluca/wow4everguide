"use client";

import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { actions, useProgress } from "@/lib/store";
import { exportFileName, parseProgress, serializeProgress } from "@/lib/progress";
import { routeTotals, sectionProgress, sectionsForPlayer, zoneProgressList, stepsForClass } from "@/lib/derive";
import { zoneById } from "@/data/zones";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { CharacterForm } from "@/components/shared/character-form";
import { ClientOnly } from "@/components/shared/client-only";
import { StepItem } from "@/components/route/step-item";

type Message = { kind: "success" | "error"; text: string } | null;

function DataTools() {
  const state = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message>(null);

  function exportJson() {
    const blob = new Blob([serializeProgress(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName();
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ kind: "success", text: "Export erstellt." });
  }

  async function importJson(file: File) {
    try {
      const parsed = parseProgress(JSON.parse(await file.text()));
      if (!parsed.ok) {
        setMessage({ kind: "error", text: parsed.error });
        return;
      }
      actions.importState(parsed.state);
      setMessage({
        kind: "success",
        text: `Import erfolgreich: ${Object.keys(parsed.state.completedSteps).length} erledigte Stationen übernommen.${parsed.warnings.length ? ` Hinweise: ${parsed.warnings.join(" ")}` : ""}`,
      });
    } catch {
      setMessage({ kind: "error", text: "Die Datei ist kein gültiges JSON." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daten sichern</CardTitle>
        <CardDescription>
          Alles liegt nur in diesem Browser (localStorage) und übersteht Neustarts. Für Gerätewechsel oder Backups als JSON exportieren.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportJson}>
            <Download /> Export (JSON)
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> Import (JSON)
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            data-testid="import-input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importJson(f);
            }}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <RotateCcw /> Zurücksetzen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Gesamten Fortschritt löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Stufe, erledigte Stationen, Berufe und Notizen werden unwiderruflich gelöscht. Tipp: Vorher exportieren.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    actions.reset();
                    setMessage({ kind: "success", text: "Fortschritt zurückgesetzt." });
                  }}
                >
                  Endgültig löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {message && (
          <Alert variant={message.kind === "error" ? "destructive" : "info"} role="status">
            <AlertTitle>{message.kind === "error" ? "Fehler" : "Erledigt"}</AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          Zuletzt gespeichert: {state.updatedAt.startsWith("1970") ? "noch nie" : new Date(state.updatedAt).toLocaleString("de-DE")}
        </p>
      </CardContent>
    </Card>
  );
}

function TaskOverview() {
  const state = useProgress();
  const { faction, raceId, classId } = state.settings;
  const sections = sectionsForPlayer(faction, raceId, classId);
  const all = sections.flatMap((s) => stepsForClass(s, classId).map((step) => ({ step, section: s })));
  const open = all.filter((x) => !(x.step.id in state.completedSteps));
  const done = all
    .filter((x) => x.step.id in state.completedSteps)
    .sort((a, b) => (state.completedSteps[b.step.id] ?? 0) - (state.completedSteps[a.step.id] ?? 0));
  const importantOpen = open.filter((x) => x.step.important);

  const renderList = (items: typeof all, isDone: boolean) =>
    items.length === 0 ? (
      <p className="p-2 text-sm text-muted-foreground">Keine Einträge.</p>
    ) : (
      <ul className="-mx-2 max-h-[28rem] overflow-y-auto">
        {items.slice(0, 80).map(({ step, section }) => (
          <StepItem
            key={step.id}
            step={step}
            done={isDone}
            showQuests={false}
            context={`${zoneById.get(section.zoneId)?.name} · ${section.levelMin}–${section.levelMax}`}
          />
        ))}
      </ul>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aufgaben</CardTitle>
        <CardDescription>Offene und abgeschlossene Stationen deiner Route.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="important">
          <TabsList>
            <TabsTrigger value="important">Wichtig offen <Badge variant="secondary">{importantOpen.length}</Badge></TabsTrigger>
            <TabsTrigger value="open">Offen <Badge variant="secondary">{open.length}</Badge></TabsTrigger>
            <TabsTrigger value="done">Erledigt <Badge variant="secondary">{done.length}</Badge></TabsTrigger>
          </TabsList>
          <TabsContent value="important">{renderList(importantOpen, false)}</TabsContent>
          <TabsContent value="open">{renderList(open, false)}</TabsContent>
          <TabsContent value="done">{renderList(done, true)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ProgressContent() {
  const state = useProgress();
  const totals = routeTotals(state);
  const zonesProgress = zoneProgressList(state);
  const sections = sectionsForPlayer(state.settings.faction, state.settings.raceId, state.settings.classId);

  return (
    <>
      <PageHeader title="Fortschritt & Einstellungen" description="Charakter, Notizen, Fortschritt pro Gebiet sowie Export, Import und Zurücksetzen." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Charakter</CardTitle>
          <CardDescription>Klasse und Fraktion sind jederzeit wechselbar – erledigte Stationen bleiben gespeichert.</CardDescription>
        </CardHeader>
        <CardContent>
          <CharacterForm />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fortschritt pro Gebiet</CardTitle>
            <CardDescription>
              Gesamt: {totals.done}/{totals.total} Stationen ({totals.percent} %)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gebiet</TableHead>
                  <TableHead className="w-1/2">Fortschritt</TableHead>
                  <TableHead className="text-right">Stationen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zonesProgress.map((z) => (
                  <TableRow key={z.zoneId}>
                    <TableCell className="font-medium">{zoneById.get(z.zoneId)?.name}</TableCell>
                    <TableCell>
                      <Progress value={z.percent} aria-label={`Fortschritt ${zoneById.get(z.zoneId)?.name}`} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {z.done}/{z.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-2 text-xs text-muted-foreground">
              Abgeschlossene Abschnitte: {sections.filter((s) => sectionProgress(s, state.completedSteps, state.settings.classId).complete).length} von {sections.length}
            </p>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <DataTools />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Persönliche Notizen</CardTitle>
              <CardDescription>Wird automatisch gespeichert.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={state.notes}
                onChange={(e) => actions.setNotes(e.target.value)}
                placeholder="z. B. Questitems, die ich aufhebe, Gold-Ziele, Erinnerungen…"
                className="min-h-40"
                aria-label="Persönliche Notizen"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <TaskOverview />
    </>
  );
}

export function ProgressView() {
  return (
    <ClientOnly fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <ProgressContent />
    </ClientOnly>
  );
}
