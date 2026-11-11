import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { APP_STORAGE_KEY, LEGACY_STORAGE_KEY } from "@/lib/profiles";
import { createDefaultState } from "@/lib/progress";
import { useProfiles } from "@/lib/store";

function Probe() {
  const app = useProfiles();
  return (
    <span data-testid="out">
      {app.profiles.length}:{app.profiles[0].name}:{app.profiles[0].state.settings.level}
    </span>
  );
}

describe("Migration vom Einzelcharakter", () => {
  it("übernimmt den gespeicherten Fortschritt der Vorgängerversion als Charakter 1", () => {
    const old = createDefaultState();
    old.settings.level = 33;
    old.completedSteps["a-wl-1"] = 1;
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(old));
    render(<Probe />);
    expect(screen.getByTestId("out").textContent).toBe("1:Charakter 1:33");
    // Das alte Backup bleibt unangetastet erhalten.
    expect(JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)!).settings.level).toBe(33);
    expect(localStorage.getItem(APP_STORAGE_KEY)).toBeNull();
  });
});
