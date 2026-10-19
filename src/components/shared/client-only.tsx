"use client";

import type { ReactNode } from "react";
import { useHydrated } from "@/lib/store";

/** Rendert Kinder erst im Browser, damit gespeicherter Fortschritt ohne Flackern erscheint. */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const hydrated = useHydrated();
  return hydrated ? children : fallback;
}
