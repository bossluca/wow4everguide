"use client";

import Link from "@/components/shared/site-link";
import { actions, useHydrated, useProfiles } from "@/lib/store";
import { activeProfile } from "@/lib/profiles";
import { classById } from "@/data/classes";
import { xpProgress } from "@/lib/derive";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FactionBadge } from "@/components/shared/faction-badge";

export function PlayerStatus() {
  const app = useProfiles();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-24" />;
  const profile = activeProfile(app);
  const { level, xp, classId, faction } = profile.state.settings;
  return (
    <div className="space-y-2 rounded-lg border bg-background/50 p-3 text-sm">
      <Select value={profile.id} onValueChange={actions.switchProfile}>
        <SelectTrigger size="sm" className="w-full" aria-label="Charakter wechseln">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {app.profiles.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          Stufe {level} · {classById.get(classId)?.name}
        </span>
        <FactionBadge faction={faction} />
      </div>
      <Progress value={xpProgress(level, xp).percentTo60} aria-label="XP-Fortschritt bis Stufe 60" />
      <Link href="/progress" className="block text-xs text-muted-foreground hover:underline">
        Charaktere verwalten
      </Link>
    </div>
  );
}
