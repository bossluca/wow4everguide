import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { APP_STORAGE_KEY, activeProfile, type AppData } from "@/lib/profiles";
import { actions, useProgress } from "@/lib/store";
import { StepItem } from "@/components/route/step-item";
import { sectionById } from "@/data/route";

function Probe() {
  const s = useProgress();
  return (
    <div>
      <span data-testid="level">{s.settings.level}</span>
      <span data-testid="class">{s.settings.classId}</span>
      <span data-testid="done">{Object.keys(s.completedSteps).length}</span>
    </div>
  );
}

function StepProbe() {
  const s = useProgress();
  const step = sectionById.get("a-westfall")!.steps[0];
  return (
    <ul>
      <StepItem step={step} done={step.id in s.completedSteps} />
    </ul>
  );
}

const STORAGE_KEY = APP_STORAGE_KEY;

/** Gespeicherter Fortschritt des aktiven Charakters. */
function savedState() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!) as AppData;
  return activeProfile(data).state;
}

describe("Store & Persistenz", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => actions.reset());
  });
  afterEach(() => cleanup());

  it("speichert Änderungen im localStorage", () => {
    render(<Probe />);
    act(() => {
      actions.setLevel(23);
      actions.setClass("priest");
      actions.toggleStep("a-wl-1");
    });
    expect(screen.getByTestId("level").textContent).toBe("23");
    const data = savedState();
    expect(data.settings.level).toBe(23);
    expect(data.settings.classId).toBe("priest");
    expect(data.completedSteps["a-wl-1"]).toBeTypeOf("number");
  });

  it("Klassenwechsel löscht keinen Fortschritt", () => {
    render(<Probe />);
    act(() => {
      actions.toggleStep("a-wl-1", true);
      actions.toggleStep("a-wl-2", true);
      actions.setClass("paladin");
    });
    expect(screen.getByTestId("done").textContent).toBe("2");
    expect(screen.getByTestId("class").textContent).toBe("paladin");
  });

  it("Checkbox in der Station schaltet den Status um", () => {
    render(<StepProbe />);
    const box = screen.getByRole("checkbox");
    expect(box.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(box);
    expect(screen.getByRole("checkbox").getAttribute("data-state")).toBe("checked");
    expect(savedState().completedSteps["a-wf-1"]).toBeDefined();
  });

  it("begrenzt Hauptberufe auf zwei", () => {
    act(() => {
      actions.addPrimaryProfession("herbalism");
      actions.addPrimaryProfession("mining");
      actions.addPrimaryProfession("skinning");
    });
    const data = savedState();
    expect(data.professions.primary.map((p: { id: string }) => p.id)).toEqual(["herbalism", "mining"]);
  });

  it("Klassenwechsel entfernt nur ein unpassendes Volk", () => {
    act(() => {
      actions.setRace("nightelf");
      actions.setClass("priest");
    });
    expect(savedState().settings.raceId).toBe("nightelf");
    act(() => actions.setClass("paladin"));
    expect(savedState().settings.raceId).toBeNull();
  });

  it("Fraktionswechsel entfernt unpassendes Volk", () => {
    act(() => {
      actions.setRace("human");
      actions.setFaction("horde");
    });
    expect(savedState().settings.raceId).toBeNull();
  });
});

describe("XP-Aktionen", () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => actions.reset());
  });

  it("addXp steigt automatisch auf", () => {
    act(() => {
      actions.setLevel(1);
      actions.addXp(1500); // 400 (1→2) + 900 (2→3) + 200
    });
    const s = savedState();
    expect(s.settings.level).toBe(3);
    expect(s.settings.xp).toBe(200);
  });

  it("Stufenänderung begrenzt XP", () => {
    act(() => {
      actions.setLevel(20);
      actions.setXp(20000);
      actions.setLevel(2);
    });
    expect(savedState().settings.xp).toBe(899);
  });

  it("Sitzung startet und stoppt", () => {
    act(() => actions.startSession());
    expect(savedState().session).not.toBeNull();
    act(() => actions.stopSession());
    expect(savedState().session).toBeNull();
  });
});
