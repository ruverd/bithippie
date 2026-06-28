import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Command,
  CommandDialog,
  CommandItem,
  CommandList,
} from "./command";

describe("Command", () => {
  it("renders items in a list", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Ping</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("Ping")).toBeInTheDocument();
  });

  it("renders children when the dialog is open", () => {
    render(
      <CommandDialog open onOpenChange={() => {}}>
        <CommandList>
          <CommandItem>Pong</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(screen.getByText("Pong")).toBeInTheDocument();
  });
});
