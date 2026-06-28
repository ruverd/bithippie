import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  CommandPaletteProvider,
  useCommandPalette,
} from "@/components/command-palette/command-palette-context";
import { renderWithProviders } from "@/test/render";
import { AppTopBar } from "./app-top-bar";

function StateProbe() {
  const { open } = useCommandPalette();
  return <span data-testid="state">{open ? "open" : "closed"}</span>;
}

function renderTopBar() {
  return render(
    <MemoryRouter initialEntries={["/projects"]}>
      <SidebarProvider>
        <CommandPaletteProvider>
          <AppTopBar />
          <StateProbe />
        </CommandPaletteProvider>
      </SidebarProvider>
    </MemoryRouter>,
  );
}

describe("AppTopBar", () => {
  it.each([
    ["/", "Dashboard"],
    ["/projects", "Projects"],
    ["/my-experiments", "My Experiments"],
  ])("should derives the page title %s -> %s", (route, title) => {
    renderWithProviders(
      <SidebarProvider>
        <CommandPaletteProvider>
          <AppTopBar />
        </CommandPaletteProvider>
      </SidebarProvider>,
      { route },
    );
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it("should links Home to the root", () => {
    renderWithProviders(
      <SidebarProvider>
        <CommandPaletteProvider>
          <AppTopBar />
        </CommandPaletteProvider>
      </SidebarProvider>,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("opens the command palette when the search button is clicked", () => {
    renderTopBar();
    expect(screen.getByTestId("state")).toHaveTextContent("closed");
    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(screen.getByTestId("state")).toHaveTextContent("open");
  });

  it("should toggles the sidebar from the menu button", async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <SidebarProvider open onOpenChange={onOpenChange}>
        <CommandPaletteProvider>
          <AppTopBar />
        </CommandPaletteProvider>
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
