"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Compass, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { navItems } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";
import { PlayerStatus } from "./player-status";
import { SearchDialog } from "./search-dialog";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Hauptnavigation">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Compass className="size-4" />
      </span>
      <span className="leading-tight">
        Forever Companion
        <span className="block text-xs font-normal text-muted-foreground">Leveling 1–60</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col gap-4 border-r bg-sidebar p-3 text-sidebar-foreground md:flex">
        <div className="px-1 pt-1">
          <Brand />
        </div>
        <SearchDialog />
        <NavLinks />
        <div className="mt-auto space-y-2">
          <PlayerStatus />
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span>Daten: Stand 19.10.2026</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur md:hidden">
          <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Menü öffnen">
            <Menu />
          </Button>
          <Brand />
          <div className="ml-auto flex items-center gap-1">
            <SearchDialog compact />
            <ThemeToggle />
          </div>
        </header>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 bg-sidebar p-3">
            <SheetHeader className="p-1">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription className="sr-only">Bereiche der App</SheetDescription>
            </SheetHeader>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <PlayerStatus />
            </div>
          </SheetContent>
        </Sheet>
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
