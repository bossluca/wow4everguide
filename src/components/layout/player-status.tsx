"use client";

import { useProgress, useHydrated } from "@/lib/store";
import { classById } from "@/data/classes";
import { levelPercent } from "@/lib/derive";
import { Progress } from "@/components/ui/progress";
import { FactionBadge } from "@/components/shared/faction-badge";

export function PlayerStatus() {
  const state = useProgress();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-16" />;
  const { level, classId, faction } = state.settings;
  return (
    <div className="space-y-2 rounded-lg border bg-background/50 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">
          Stufe {level} · {classById.get(classId)?.name}
        </span>
        <FactionBadge faction={faction} />
      </div>
      <Progress value={levelPercent(level)} aria-label="Fortschritt bis Stufe 60" />
    </div>
  );
}
