import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router-dom";
import { CommandPaletteProvider } from "./command-palette-context";
import { CommandPalette } from "./command-palette";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  useGetProjects: vi.fn(),
}));
vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({ data: [] }),
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="loc">{location.pathname}</div>;
}

function renderPalette() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/"]}>
        <CommandPaletteProvider>
          <CommandPalette />
          <LocationDisplay />
        </CommandPaletteProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  (useGetProjects as Mock).mockReturnValue({
    data: [
      { id: "p1", title: "Alpha Study" },
      { id: "p2", title: "Beta Trial" },
    ],
  });
});

function openPalette() {
  fireEvent.keyDown(document, { key: "k", metaKey: true });
}

describe("CommandPalette", () => {
  it("opens on Cmd+K and shows the group items", () => {
    renderPalette();
    openPalette();
    expect(screen.getByRole("option", { name: "New Project" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Alpha Study" })).toBeInTheDocument();
  });

  it("navigates to a menu page from the Go to group", () => {
    renderPalette();
    openPalette();
    fireEvent.click(screen.getByRole("option", { name: "Experiments" }));
    expect(screen.getByTestId("loc")).toHaveTextContent("/experiments");
  });

  it("opens the project create dialog from the Create group", async () => {
    renderPalette();
    openPalette();
    fireEvent.click(screen.getByRole("option", { name: "New Project" }));
    await waitFor(() =>
      expect(
        screen.getByText("Create a new research project and assign a lead."),
      ).toBeInTheDocument(),
    );
  });

  it("navigates to project detail when a project result is selected", () => {
    renderPalette();
    openPalette();
    fireEvent.change(screen.getByPlaceholderText("Search or jump to…"), {
      target: { value: "Alpha" },
    });
    fireEvent.click(screen.getByRole("option", { name: "Alpha Study" }));
    expect(screen.getByTestId("loc")).toHaveTextContent("/projects/p1");
  });
});
