import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { renderWithProviders } from "@/test/render";
import { LabSidebar } from "./lab-sidebar";

const NAV_LABELS = [
  "Dashboard",
  "Projects",
  "Experiments",
  "Samples",
  "Measurements",
  "Researchers",
];

function renderSidebar(route = "/") {
  return renderWithProviders(
    <SidebarProvider>
      <LabSidebar />
    </SidebarProvider>,
    { route },
  );
}

describe("LabSidebar", () => {
  it("should renders every nav item as a link", () => {
    renderSidebar();
    for (const label of NAV_LABELS) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("should marks the current route as active", () => {
    renderSidebar("/projects");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Dashboard" }),
    ).not.toHaveAttribute("aria-current", "page");
  });

  it("should treats nested routes as active for non-end items", () => {
    renderSidebar("/projects/123");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("should shows the researcher in the footer", () => {
    renderSidebar();
    expect(screen.getByText("Jason Davis-Cooke")).toBeInTheDocument();
    expect(screen.getByText("Principal Investigator")).toBeInTheDocument();
  });
});
