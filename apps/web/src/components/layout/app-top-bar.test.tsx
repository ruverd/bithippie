import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarProvider } from "@/components/ui/sidebar";
import { renderWithProviders } from "@/test/render";
import { AppTopBar } from "./app-top-bar";

describe("AppTopBar", () => {
  it.each([
    ["/", "Dashboard"],
    ["/projects", "Projects"],
    ["/my-experiments", "My Experiments"],
  ])("should derives the page title %s -> %s", (route, title) => {
    renderWithProviders(
      <SidebarProvider>
        <AppTopBar />
      </SidebarProvider>,
      { route },
    );
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it("should links Home to the root", () => {
    renderWithProviders(
      <SidebarProvider>
        <AppTopBar />
      </SidebarProvider>,
    );
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("should renders the search field", () => {
    renderWithProviders(
      <SidebarProvider>
        <AppTopBar />
      </SidebarProvider>,
    );
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
  });

  it("should toggles the sidebar from the menu button", async () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <SidebarProvider open onOpenChange={onOpenChange}>
        <AppTopBar />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle menu" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
