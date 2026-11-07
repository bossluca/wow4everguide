"use client";

import { useState } from "react";
import { Check, Plus, Trash2, UserRound } from "lucide-react";
import { actions, useProfiles } from "@/lib/store";
import { MAX_NAME_LENGTH, MAX_PROFILES, profilePresets, type Profile } from "@/lib/profiles";
import { classById } from "@/data/classes";
import { raceById } from "@/data/races";
import { xpProgress } from "@/lib/derive";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FactionBadge } from "@/components/shared/faction-badge";

function ProfileRow({ profile, active, canDelete }: { profile: Profile; active: boolean; canDelete: boolean }) {
  const [name, setName] = useState(profile.name);
  const { level, xp, classId, faction, raceId } = profile.state.settings;
  const done = Object.keys(profile.state.completedSteps).length;

  function commit() {
    if (name.trim() && name.trim() !== profile.name) actions.renameProfile(profile.id, name);
    else setName(profile.name);
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border p-3" data-testid="profile-row">
      <Input
        value={name}
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => setName(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="h-8 w-48 font-medium"
        aria-label={`Name von ${profile.name}`}
      />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-xs">
        <FactionBadge faction={faction} />
        <Badge variant="secondary">{classById.get(classId)?.name}</Badge>
        {raceId && <Badge variant="outline">{raceById.get(raceId)?.name}</Badge>}
        <span className="text-muted-foreground tabular-nums">
          Stufe {level} · {xpProgress(level, xp).percentTo60.toLocaleString("de-DE")} % · {done} Stationen
        </span>
      </div>
      {active ? (
        <Badge variant="success">
          <Check /> Aktiv
        </Badge>
      ) : (
        <Button size="sm" variant="outline" onClick={() => actions.switchProfile(profile.id)}>
          Wechseln
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="icon-sm" variant="ghost" disabled={!canDelete} aria-label={`${profile.name} löschen`}>
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Charakter „{profile.name}“ löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Fortschritt, Berufe und Notizen dieses Charakters werden unwiderruflich gelöscht. Andere Charaktere bleiben erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => actions.deleteProfile(profile.id)}>Endgültig löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

export function ProfilesCard() {
  const app = useProfiles();
  const [name, setName] = useState("");
  const full = app.profiles.length >= MAX_PROFILES;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="size-4" /> Charaktere
        </CardTitle>
        <CardDescription>
          Jeder Charakter hat eigenen Fortschritt, eigene Berufe und eigene Notizen. Gewechselt wird auch in der Seitenleiste.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {app.profiles.map((p) => (
            <ProfileRow key={`${p.id}-${p.name}`} profile={p} active={p.id === app.activeId} canDelete={app.profiles.length > 1} />
          ))}
        </ul>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            actions.addProfile(name);
            setName("");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="new-profile">Neuer Charakter</Label>
            <Input
              id="new-profile"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              placeholder={`Charakter ${app.profiles.length + 1}`}
              onChange={(e) => setName(e.target.value)}
              className="h-8 w-52"
              disabled={full}
            />
          </div>
          <Button type="submit" size="sm" variant="outline" disabled={full}>
            <Plus /> Anlegen
          </Button>
        </form>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Schnellstart:</span>
          {profilePresets.map((preset) => (
            <Button
              key={preset.id}
              size="sm"
              variant="secondary"
              disabled={full}
              onClick={() => actions.addProfile(preset.name, { faction: preset.faction, classId: preset.classId, raceId: preset.raceId })}
            >
              <Plus /> {preset.name}
            </Button>
          ))}
        </div>
        {full && <p className="text-xs text-warning">Maximal {MAX_PROFILES} Charaktere – lösche einen, um einen neuen anzulegen.</p>}
      </CardContent>
    </Card>
  );
}
