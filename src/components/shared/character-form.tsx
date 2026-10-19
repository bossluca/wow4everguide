"use client";

import { Minus, Plus } from "lucide-react";
import type { ClassId, Faction, RaceId } from "@/lib/types";
import { actions, useProgress } from "@/lib/store";
import { classGuides } from "@/data/classes";
import { races } from "@/data/races";
import { zones } from "@/data/zones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ANY = "__any";

export function LevelStepper() {
  const { level } = useProgress().settings;
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon-sm" onClick={() => actions.setLevel(level - 1)} aria-label="Stufe verringern" disabled={level <= 1}>
        <Minus />
      </Button>
      <Input
        type="number"
        min={1}
        max={60}
        value={level}
        onChange={(e) => actions.setLevel(Number(e.target.value))}
        className="h-8 w-16 text-center tabular-nums"
        aria-label="Aktuelle Stufe"
      />
      <Button variant="outline" size="icon-sm" onClick={() => actions.setLevel(level + 1)} aria-label="Stufe erhöhen" disabled={level >= 60}>
        <Plus />
      </Button>
    </div>
  );
}

export function CharacterForm({ showZone = true }: { showZone?: boolean }) {
  const { faction, classId, raceId, currentZoneId } = useProgress().settings;
  const raceOptions = races.filter((r) => r.faction === faction && r.classes.includes(classId));
  const zoneOptions = zones.filter((z) => z.faction === faction || z.faction === "contested" || z.faction === "neutral");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="cf-level">Stufe</Label>
        <LevelStepper />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-faction">Fraktion</Label>
        <Select value={faction} onValueChange={(v) => actions.setFaction(v as Faction)}>
          <SelectTrigger id="cf-faction" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alliance">Allianz</SelectItem>
            <SelectItem value="horde">Horde</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-class">Klasse</Label>
        <Select value={classId} onValueChange={(v) => actions.setClass(v as ClassId)}>
          <SelectTrigger id="cf-class" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {classGuides.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-race">Volk (bestimmt das Startgebiet)</Label>
        <Select value={raceId && raceOptions.some((r) => r.id === raceId) ? raceId : ANY} onValueChange={(v) => actions.setRace(v === ANY ? null : (v as RaceId))}>
          <SelectTrigger id="cf-race" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Noch offen – alle Startgebiete zeigen</SelectItem>
            {raceOptions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showZone && (
        <div className="space-y-1.5">
          <Label htmlFor="cf-zone">Aktuelles Gebiet</Label>
          <Select value={currentZoneId ?? ANY} onValueChange={(v) => actions.setCurrentZone(v === ANY ? null : v)}>
            <SelectTrigger id="cf-zone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Automatisch aus Stufe & Fortschritt</SelectItem>
              {zoneOptions.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.name} ({z.levelMin}–{z.levelMax})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
