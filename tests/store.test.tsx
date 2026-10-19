import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { STORAGE_KEY } from "@/lib/progress";
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
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.settings.level).toBe(23);
    expect(saved.settings.classId).toBe("priest");
    expect(saved.completedSteps["a-wl-1"]).toBeTypeOf("number");
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
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).completedSteps["a-wf-1"]).toBeDefined();
  });

  it("begrenzt Hauptberufe auf zwei", () => {
    act(() => {
      actions.addPrimaryProfession("herbalism");
      actions.addPrimaryProfession("mining");
      actions.addPrimaryProfession("skinning");
    });
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.professions.primary.map((p: { id: string }) => p.id)).toEqual(["herbalism", "mining"]);
  });

  it("Klassenwechsel entfernt nur ein unpassendes Volk", () => {
    act(() => {
      actions.setRace("nightelf");
      actions.setClass("priest");
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).settings.raceId).toBe("nightelf");
    act(() => actions.setClass("paladin"));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).settings.raceId).toBeNull();
  });

  it("Fraktionswechsel entfernt unpassendes Volk", () => {
    act(() => {
      actions.setRace("human");
      actions.setFaction("horde");
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).settings.raceId).toBeNull();
  });
});
