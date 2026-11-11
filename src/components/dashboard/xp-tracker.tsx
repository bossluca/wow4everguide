"use client";

import { useEffect, useState } from "react";
import { Play, Plus, Square, Timer } from "lucide-react";
import { actions, useProgress } from "@/lib/store";
import { sessionStats, xpProgress } from "@/lib/derive";
import { xpVerification } from "@/data/xp";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { VerificationBadge } from "@/components/shared/verification-badge";

const fmt = new Intl.NumberFormat("de-DE");

function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${Math.round(min - h * 60)} min`;
}

/** Aktualisiert die Uhrzeit minütlich, solange eine Sitzung läuft. */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

export function XpTracker() {
  const state = useProgress();
  const { level, xp } = state.settings;
  const progress = xpProgress(level, xp);
  const now = useNow(state.session !== null);
  const stats = sessionStats(state, now);
  const [gain, setGain] = useState("");
  const maxed = level >= 60;

  function submitGain() {
    const n = Number(gain.replace(/\./g, ""));
    if (n > 0) actions.addXp(n);
    setGain("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="size-4" /> XP-Tracker
        </CardTitle>
        <CardDescription>Genauer Fortschritt nach XP statt Stufen – plus XP/Stunde für die aktuelle Sitzung.</CardDescription>
        <CardAction>
          <VerificationBadge verification={xpVerification} compact />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Stufe {level}</span>
              <span className="tabular-nums">{maxed ? "Maximalstufe" : `${fmt.format(xp)} / ${fmt.format(progress.levelNeeded)} XP`}</span>
            </div>
            <Progress value={progress.levelPercent} aria-label="XP in der aktuellen Stufe" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bis Stufe 60</span>
              <span className="tabular-nums">{progress.percentTo60.toLocaleString("de-DE")} %</span>
            </div>
            <Progress value={progress.percentTo60} aria-label="XP-Fortschritt bis Stufe 60" />
            <p className="text-xs text-muted-foreground tabular-nums">Noch {fmt.format(progress.remainingTo60)} XP</p>
          </div>
        </div>

        {!maxed && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="xp-current">XP in dieser Stufe</Label>
              <Input
                id="xp-current"
                type="number"
                min={0}
                max={progress.levelNeeded - 1}
                value={xp}
                onChange={(e) => actions.setXp(Number(e.target.value))}
                className="h-8 tabular-nums"
              />
            </div>
            <form
              className="space-y-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                submitGain();
              }}
            >
              <Label htmlFor="xp-gain">XP hinzufügen (z. B. Questbelohnung)</Label>
              <div className="flex gap-2">
                <Input
                  id="xp-gain"
                  inputMode="numeric"
                  placeholder="z. B. 1450"
                  value={gain}
                  onChange={(e) => setGain(e.target.value)}
                  className="h-8 tabular-nums"
                />
                <Button type="submit" size="sm" variant="outline" aria-label="XP hinzufügen">
                  <Plus />
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
          {stats ? (
            <>
              <div className="flex flex-1 flex-wrap gap-x-5 gap-y-1">
                <span>
                  <span className="text-muted-foreground">Sitzung: </span>
                  {formatMinutes(stats.minutes)}
                </span>
                <span>
                  <span className="text-muted-foreground">Gewonnen: </span>
                  {fmt.format(stats.gained)} XP
                </span>
                <span>
                  <span className="text-muted-foreground">Tempo: </span>
                  {stats.xpPerHour ? `${fmt.format(stats.xpPerHour)} XP/h` : "ab 5 min und erstem XP-Gewinn"}
                </span>
                {stats.minutesToNextLevel !== null && (
                  <span>
                    <span className="text-muted-foreground">Nächste Stufe: </span>~{formatMinutes(stats.minutesToNextLevel)}
                  </span>
                )}
                {stats.hoursTo60 !== null && (
                  <span>
                    <span className="text-muted-foreground">Bis 60: </span>~{stats.hoursTo60.toLocaleString("de-DE")} h Spielzeit
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => actions.stopSession()}>
                <Square /> Sitzung beenden
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 text-muted-foreground">
                Starte eine Sitzung und trage XP nach – die App schätzt dein Tempo. Schätzungen gelten nur für das aktuelle Tempo.
              </span>
              <Button size="sm" variant="outline" onClick={() => actions.startSession()} disabled={maxed}>
                <Play /> Sitzung starten
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
