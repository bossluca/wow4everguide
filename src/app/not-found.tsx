import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="space-y-3 py-16 text-center">
      <h1 className="text-xl font-semibold">Seite nicht gefunden</h1>
      <Button asChild variant="outline">
        <Link href="/">Zum Dashboard</Link>
      </Button>
    </div>
  );
}
