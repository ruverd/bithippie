import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { DashboardSkeleton } from "./dashboard-skeleton";

describe("DashboardSkeleton", () => {
  it("should expose a status role for screen readers", () => {
    renderWithProviders(<DashboardSkeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render the loading dashboard label", () => {
    renderWithProviders(<DashboardSkeleton />);
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });
});
