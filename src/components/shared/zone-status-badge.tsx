import type { ForeverZoneStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const meta: Record<ForeverZoneStatus, { label: string; variant: "info" | "warning" | "secondary" | "outline" } | null> = {
  new: { label: "Neu in Forever", variant: "info" },
  revamped: { label: "Überarbeitet", variant: "info" },
  changed: { label: "Verändert", variant: "outline" },
  classic: null,
};

export function ZoneStatusBadge({ status }: { status: ForeverZoneStatus }) {
  const m = meta[status];
  if (!m) return null;
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
