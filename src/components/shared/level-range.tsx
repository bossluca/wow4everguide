import { Badge } from "@/components/ui/badge";

export function LevelRange({ min, max }: { min: number; max: number }) {
  return (
    <Badge variant="secondary" className="font-mono tabular-nums">
      {min === max ? `Stufe ${min}` : `${min}–${max}`}
    </Badge>
  );
}
