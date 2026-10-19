import type { Metadata } from "next";
import { Suspense } from "react";
import { RouteView } from "@/components/route/route-view";

export const metadata: Metadata = { title: "Levelroute" };

export default function Page() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <RouteView />
    </Suspense>
  );
}
