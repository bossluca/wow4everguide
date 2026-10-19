"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const THEME_KEY = "wowf-theme";

/** Inline-Skript für <head>: setzt das Theme vor dem ersten Paint (Standard: dunkel). */
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light")document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}`;

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const dark = root.classList.toggle("dark");
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      // ignorieren
    }
  }
  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Hell/Dunkel umschalten">
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  );
}
