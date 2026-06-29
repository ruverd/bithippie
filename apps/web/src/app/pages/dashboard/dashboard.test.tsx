import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  useGetProjects: vi.fn(),
}));
vi.mock("@/generated/hooks/experiments/useGetExperiments", () => ({
  useGetExperiments: vi.fn(),
}));
vi.mock("@/generated/hooks/samples/useGetSamples", () => ({
  useGetSamples: vi.fn(),
}));
vi.mock("@/generated/hooks/measurements/useGetMeasurements", () => ({
  useGetMeasurements: vi.fn(),
}));

import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { useGetExperiments } from "@/generated/hooks/experiments/useGetExperiments";
import { useGetSamples } from "@/generated/hooks/samples/useGetSamples";
import { useGetMeasurements } from "@/generated/hooks/measurements/useGetMeasurements";
import { DashboardPage } from "./dashboard";

type QueryState = { data: unknown; isLoading: boolean; isError: boolean };

function setAll(state: QueryState) {
  vi.mocked(useGetProjects).mockReturnValue(state as never);
  vi.mocked(useGetExperiments).mockReturnValue(state as never);
  vi.mocked(useGetSamples).mockReturnValue(state as never);
  vi.mocked(useGetMeasurements).mockReturnValue(state as never);
}

const ready: QueryState = { data: [], isLoading: false, isError: false };

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAll(ready);
  });

  it("should render the skeleton while a query is loading", () => {
    setAll(ready);
    vi.mocked(useGetProjects).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  it("should render an error alert when a query fails", () => {
    setAll(ready);
    vi.mocked(useGetExperiments).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as never);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it("should render the four stat labels on success", () => {
    setAll(ready);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText(/active projects/i)).toBeInTheDocument();
    expect(screen.getByText(/running experiments/i)).toBeInTheDocument();
    expect(screen.getByText(/samples logged/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^measurements$/i).length).toBeGreaterThan(0);
  });
});
