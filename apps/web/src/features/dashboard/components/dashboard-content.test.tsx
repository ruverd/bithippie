import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { DashboardContent } from "./dashboard-content";

const empty = { projects: [], experiments: [], samples: [], measurements: [], now: new Date(2026, 0, 1) };

describe("DashboardContent", () => {
  it("should render the four stat cards", () => {
    renderWithProviders(<DashboardContent {...empty} />);
    expect(screen.getByText(/active projects/i)).toBeInTheDocument();
    expect(screen.getByText(/running experiments/i)).toBeInTheDocument();
    expect(screen.getByText(/samples logged/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^measurements$/i).length).toBeGreaterThan(0);
  });

  it("should render zero counts for empty data", () => {
    renderWithProviders(<DashboardContent {...empty} />);
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(4);
  });
});
