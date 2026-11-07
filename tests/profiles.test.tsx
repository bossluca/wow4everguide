import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import {
  APP_STORAGE_KEY,
  MAX_PROFILES,
  activeProfile,
  parseProfiles,
  profileExportFileName,
  serializeProfiles,
  type AppData,
} from "@/lib/profiles";
import { createDefaultState } from "@/lib/progress";
import { actions, useProfiles } from "@/lib/store";

function data(): AppData {
  return JSON.parse(localStorage.getItem(APP_STORAGE_KEY)!) as AppData;
}

function Names() {
  const app = useProfiles();
  return <p data-testid="names">{app.profiles.map((p) => `${p.name}${p.id === app.activeId ? "*" : ""}`).join(",")}</p>;
}

const latest: { current: AppData | null } = { current: null };
function Capture() {
  const app = useProfiles();
  useEffect(() => {
    latest.current = app;
  });
  return null;
}

describe("Charaktere", () => {
  beforeEach(() => {
    render(<Capture />);
    act(() => {
      // Alle Charaktere bis auf einen löschen und den Rest leeren
      for (const p of (latest.current?.profiles ?? []).slice(1)) actions.deleteProfile(p.id);
      actions.reset();
    });
  });
  afterEach(() => cleanup());

  it("legt Charaktere mit eigenem Fortschritt an und wechselt zwischen ihnen", () => {
    render(<Names />);
    act(() => {
      actions.setLevel(20);
      actions.toggleStep("a-wl-1", true);
      actions.addProfile("Mensch Hexenmeister", { faction: "alliance", classId: "warlock", raceId: "human" });
    });
    let d = data();
    expect(d.profiles).toHaveLength(2);
    expect(activeProfile(d).name).toBe("Mensch Hexenmeister");
    expect(activeProfile(d).state.settings).toMatchObject({ classId: "warlock", raceId: "human", level: 1 });
    expect(Object.keys(activeProfile(d).state.completedSteps)).toHaveLength(0);

    act(() => actions.switchProfile(d.profiles[0].id));
    d = data();
    expect(activeProfile(d).state.settings.level).toBe(20);
    expect(Object.keys(activeProfile(d).state.completedSteps)).toEqual(["a-wl-1"]);
    expect(screen.getByTestId("names").textContent).toContain("Mensch Hexenmeister");
  });

  it("benennt um, bereinigt Namen und löscht nie den letzten Charakter", () => {
    act(() => {
      actions.addProfile("  Mensch   Paladin  ");
    });
    let d = data();
    expect(activeProfile(d).name).toBe("Mensch Paladin");
    act(() => actions.renameProfile(d.activeId, "x".repeat(100)));
    expect(activeProfile(data()).name).toHaveLength(40);
    act(() => actions.renameProfile(d.activeId, "   "));
    expect(activeProfile(data()).name).toHaveLength(40);

    act(() => {
      for (const p of data().profiles) actions.deleteProfile(p.id);
    });
    d = data();
    expect(d.profiles).toHaveLength(1);
    expect(d.profiles.some((p) => p.id === d.activeId)).toBe(true);
  });

  it("zurücksetzen betrifft nur den aktiven Charakter", () => {
    act(() => {
      actions.setLevel(30);
      actions.addProfile("Zweiter");
      actions.setLevel(12);
      actions.reset();
    });
    const d = data();
    expect(d.profiles).toHaveLength(2);
    expect(activeProfile(d).state.settings.level).toBe(1);
    expect(d.profiles.find((p) => p.id !== d.activeId)?.state.settings.level).toBe(30);
  });

  it("macht doppelte Namen eindeutig", () => {
    act(() => {
      actions.addProfile("Mensch Paladin");
      actions.addProfile("mensch paladin");
      actions.addProfile("Mensch Paladin");
    });
    const names = data().profiles.map((p) => p.name).filter((n) => n.toLowerCase().startsWith("mensch paladin"));
    expect(names).toEqual(["Mensch Paladin", "mensch paladin (2)", "Mensch Paladin (3)"]);
  });

  it("begrenzt die Anzahl der Charaktere", () => {
    act(() => {
      for (let i = 0; i < MAX_PROFILES + 5; i++) actions.addProfile(`C${i}`);
    });
    expect(data().profiles).toHaveLength(MAX_PROFILES);
    expect(actions.addProfile("zu viel")).toBeNull();
  });

  it("importiert Charaktere als neue, ohne etwas zu überschreiben", () => {
    act(() => {
      actions.setLevel(25);
    });
    const incoming = parseProfiles(
      JSON.parse(
        serializeProfiles(
          [
            { id: "a", name: "Import A", state: { ...createDefaultState(), settings: { ...createDefaultState().settings, level: 40 } } },
            { id: "b", name: "Import B", state: createDefaultState() },
          ],
          "a",
        ),
      ),
    );
    expect(incoming.ok).toBe(true);
    if (!incoming.ok) return;
    let added = 0;
    act(() => {
      added = actions.importProfiles(incoming.profiles);
    });
    const d = data();
    expect(added).toBe(2);
    expect(d.profiles).toHaveLength(3);
    expect(activeProfile(d).name).toBe("Import A");
    expect(d.profiles[0].state.settings.level).toBe(25);
  });
});

describe("parseProfiles", () => {
  it("liest den Einzelcharakter-Export (Version 1)", () => {
    const state = createDefaultState();
    state.settings.level = 12;
    const parsed = parseProfiles(JSON.parse(JSON.stringify(state)));
    expect(parsed.ok && parsed.profiles[0].state.settings.level).toBe(12);
    expect(parsed.ok && parsed.profiles[0].name).toBe("Importierter Charakter");
  });

  it("verwirft ungültige Charaktere, repariert IDs und Namen", () => {
    const good = createDefaultState();
    const parsed = parseProfiles({
      version: 2,
      activeId: "gibt-es-nicht",
      profiles: [
        { id: "a", name: "  Eins ", state: good },
        { id: "a", name: "", state: good },
        { id: "c", name: "Kaputt", state: { version: 99 } },
        "müll",
      ],
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.profiles.map((p) => p.name)).toEqual(["Eins", "Charakter 2"]);
    expect(new Set(parsed.profiles.map((p) => p.id)).size).toBe(2);
    expect(parsed.activeId).toBe("a");
    expect(parsed.warnings.some((w) => w.includes("Kaputt"))).toBe(true);
  });

  it("lehnt falsche Versionen und leere Listen ab", () => {
    expect(parseProfiles(null).ok).toBe(false);
    expect(parseProfiles({ version: 7 }).ok).toBe(false);
    expect(parseProfiles({ version: 2, profiles: [] }).ok).toBe(false);
    expect(parseProfiles({ version: 2 }).ok).toBe(false);
  });

  it("erzeugt lesbare Dateinamen", () => {
    const d = new Date("2026-11-07T10:00:00Z");
    expect(profileExportFileName("Mensch Hexenmeister", d)).toBe("wow-forever-mensch-hexenmeister-2026-11-07.json");
    expect(profileExportFileName("Ärger & Co", d)).toBe("wow-forever-arger-co-2026-11-07.json");
    expect(profileExportFileName(null, d)).toBe("wow-forever-alle-charaktere-2026-11-07.json");
  });
});
