import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppShell } from "@/components/layout/app-shell";
import { themeScript } from "@/components/layout/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Forever Companion – WoW Forever Leveling 1–60",
    template: "%s · Forever Companion",
  },
  description:
    "Minimalistischer Leveling-Begleiter für World of Warcraft: Forever – Route, Klassenwahl, Berufe und Fortschritt, lokal gespeichert.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
