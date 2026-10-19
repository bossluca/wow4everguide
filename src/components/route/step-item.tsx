"use client";

import { Plane, Star, Swords, MapPin, GraduationCap, Hammer, Info, Home, Flag } from "lucide-react";
import type { RouteStep, StepKind } from "@/lib/types";
import { actions } from "@/lib/store";
import { questById } from "@/data/quests";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const kindMeta: Record<StepKind, { label: string; icon: typeof Plane }> = {
  quest: { label: "Quest", icon: Flag },
  travel: { label: "Reise", icon: Plane },
  train: { label: "Trainer", icon: GraduationCap },
  profession: { label: "Beruf", icon: Hammer },
  dungeon: { label: "Dungeon", icon: Swords },
  hub: { label: "Hub", icon: MapPin },
  hearth: { label: "Ruhestein", icon: Home },
  note: { label: "Hinweis", icon: Info },
};

export function StepItem({
  step,
  done,
  showQuests = true,
  context,
}: {
  step: RouteStep;
  done: boolean;
  showQuests?: boolean;
  /** Optionale Kontextzeile (z. B. Gebiet), oberhalb des Textes */
  context?: string;
}) {
  const meta = kindMeta[step.kind];
  const Icon = meta.icon;
  const id = `step-${step.id}`;
  return (
    <li className={cn("flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/40", done && "opacity-60")}>
      <Checkbox id={id} checked={done} onCheckedChange={(c) => actions.toggleStep(step.id, c === true)} className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-1">
        {context && <p className="text-[11px] text-muted-foreground">{context}</p>}
        <label htmlFor={id} className={cn("block cursor-pointer text-sm leading-snug", done && "line-through")}>
          {step.text}
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Icon className="size-3" />
            {meta.label}
          </span>
          {step.important && (
            <Badge variant="warning" className="gap-0.5">
              <Star className="size-3" /> Wichtig
            </Badge>
          )}
          {step.optional && <Badge variant="outline">Optional</Badge>}
          {step.classIds && <Badge variant="secondary">Nur Klasse</Badge>}
          {showQuests &&
            step.questIds?.map((qid) => {
              const q = questById.get(qid);
              return q ? (
                <Badge key={qid} variant="secondary" className="font-normal" title={q.note}>
                  {q.name}
                  {q.kind === "elite" && " (Elite)"}
                </Badge>
              ) : null;
            })}
        </div>
      </div>
    </li>
  );
}
