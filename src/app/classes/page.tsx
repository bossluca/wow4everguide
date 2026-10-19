import type { Metadata } from "next";
import { Suspense } from "react";
import { ClassesView } from "@/components/classes/classes-view";

export const metadata: Metadata = { title: "Klassen" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <ClassesView />
    </Suspense>
  );
}
