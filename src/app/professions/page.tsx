import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfessionsView } from "@/components/professions/professions-view";

export const metadata: Metadata = { title: "Berufe & Gold" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <ProfessionsView />
    </Suspense>
  );
}
