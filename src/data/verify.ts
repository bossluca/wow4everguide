import type { Verification } from "@/lib/types";

/** Stand der Recherche. Bei Aktualisierungen hier und in den Datensätzen anpassen. */
export const DATA_CHECKED_AT = "2026-10-19";
/** Datum der letzten Aktualisierungsrunde (neu geprüfte Einträge tragen dieses Datum). */
export const DATA_UPDATED_AT = "2026-11-05";

/** Setzt ein neueres Prüfdatum, z. B. dated(v.beta([...])). */
export function dated(verification: Verification, date: string = DATA_UPDATED_AT): Verification {
  return { ...verification, checkedAt: date };
}

export const BETA_BUILD = "Beta 1.60.1.70425–70450 (Okt. 2026)";

export const v = {
  confirmed: (sourceIds: string[], note?: string, version?: string): Verification => ({
    status: "confirmed",
    sourceIds,
    note,
    version,
    checkedAt: DATA_CHECKED_AT,
  }),
  beta: (sourceIds: string[], note?: string, version: string = BETA_BUILD): Verification => ({
    status: "beta",
    sourceIds,
    note,
    version,
    checkedAt: DATA_CHECKED_AT,
  }),
  classic: (note?: string, extraSources: string[] = []): Verification => ({
    status: "classic",
    sourceIds: ["classic-reference", ...extraSources],
    note,
    version: "Classic Era 1.15",
    checkedAt: DATA_CHECKED_AT,
  }),
  provisional: (sourceIds: string[], note?: string): Verification => ({
    status: "provisional",
    sourceIds,
    note,
    checkedAt: DATA_CHECKED_AT,
  }),
};
