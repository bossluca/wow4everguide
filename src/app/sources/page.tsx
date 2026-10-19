import type { Metadata } from "next";
import { SourcesView } from "@/components/sources/sources-view";

export const metadata: Metadata = { title: "Quellen & Datenlücken" };

export default function Page() {
  return <SourcesView />;
}
