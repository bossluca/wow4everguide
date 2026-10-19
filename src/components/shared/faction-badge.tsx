import type { Faction, ZoneFaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export const factionLabel: Record<ZoneFaction, string> = {
  alliance: "Allianz",
  horde: "Horde",
  contested: "Umkämpft",
  neutral: "Neutral",
};

export function FactionBadge({ faction }: { faction: ZoneFaction | Faction }) {
  const variant = faction === "alliance" ? "alliance" : faction === "horde" ? "horde" : "secondary";
  return <Badge variant={variant}>{factionLabel[faction]}</Badge>;
}
