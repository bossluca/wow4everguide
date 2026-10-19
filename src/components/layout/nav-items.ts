import { BookOpen, Hammer, LayoutDashboard, ListChecks, Route, Swords } from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/route", label: "Levelroute", icon: Route },
  { href: "/classes", label: "Klassen", icon: Swords },
  { href: "/professions", label: "Berufe & Gold", icon: Hammer },
  { href: "/progress", label: "Fortschritt", icon: ListChecks },
  { href: "/sources", label: "Quellen & Lücken", icon: BookOpen },
] as const;
