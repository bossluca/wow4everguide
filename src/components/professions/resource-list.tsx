import { Leaf, Pickaxe, Scissors } from "lucide-react";
import type { ZoneResource } from "@/lib/derive";
import { Badge } from "@/components/ui/badge";

const icon = { herbalism: Leaf, mining: Pickaxe, skinning: Scissors };

const adviceMeta = {
  sammelbar: { label: "Sammelbar", variant: "success" as const },
  bald: { label: "Bald (Skill fehlt knapp)", variant: "warning" as const },
  "zu-niedrig": { label: "Skill zu niedrig", variant: "outline" as const },
  "kein-beruf": { label: "Kein Beruf", variant: "secondary" as const },
};

export function ResourceList({
  items,
  skinning,
  compact = false,
}: {
  items: ZoneResource[];
  skinning?: [number, number];
  compact?: boolean;
}) {
  if (items.length === 0 && !skinning) {
    return <p className="text-sm text-muted-foreground">Für dieses Gebiet sind keine Ressourcen dokumentiert.</p>;
  }
  const sorted = [...items].sort((a, b) => Number(b.detour) - Number(a.detour) || a.resource.skill - b.resource.skill);
  return (
    <ul className="divide-y text-sm">
      {sorted.map(({ resource, advice, detour }) => {
        const Icon = icon[resource.professionId];
        const meta = adviceMeta[advice];
        return (
          <li key={resource.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5">
            <Icon className="size-3.5 text-muted-foreground" aria-hidden />
            <span className="min-w-0 flex-1 font-medium">{resource.name}</span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">Skill {resource.skill || "?"}</span>
            {!compact && <Badge variant="secondary">Nachfrage {resource.demand}</Badge>}
            <Badge variant={meta.variant}>{meta.label}</Badge>
            {detour && <Badge variant="info">Kleiner Umweg lohnt</Badge>}
          </li>
        );
      })}
      {skinning && (
        <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5">
          <Scissors className="size-3.5 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 font-medium">Kürschnern (Wildtiere)</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            Skill {skinning[0] === skinning[1] ? skinning[0] : `${skinning[0]}–${skinning[1]}`}
          </span>
        </li>
      )}
    </ul>
  );
}
