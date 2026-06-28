import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CommandPaletteProvider, useCommandPalette } from "./command-palette-context";

function Probe() {
  const { open, setOpen } = useCommandPalette();
  return (
    <div>
      <span data-testid="state">{open ? "open" : "closed"}</span>
      <button onClick={() => setOpen(true)}>force-open</button>
    </div>
  );
}

describe("CommandPaletteProvider", () => {
  it("starts closed and toggles on Cmd+K", () => {
    render(
      <CommandPaletteProvider>
        <Probe />
      </CommandPaletteProvider>,
    );
    expect(screen.getByTestId("state")).toHaveTextContent("closed");

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("open");

    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("closed");
  });

  it("opens via setOpen and on Ctrl+K", () => {
    render(
      <CommandPaletteProvider>
        <Probe />
      </CommandPaletteProvider>,
    );
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("open");
  });
});
