import type { Faction, RouteSection } from "@/lib/types";
import { allianceRoute } from "./alliance";
import { hordeRoute } from "./horde";

export const routes: Record<Faction, RouteSection[]> = {
  alliance: allianceRoute,
  horde: hordeRoute,
};

export const allSections: RouteSection[] = [...allianceRoute, ...hordeRoute];

export const sectionById = new Map(allSections.map((s) => [s.id, s]));
