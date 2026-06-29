import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";

const experimentData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/experiments/useGetExperimentsByExperimentId", () => ({
  useGetExperimentsByExperimentId: () => experimentData(),
}));

vi.mock("@/generated/hooks/experiments/useGetExperimentsByExperimentIdMeasurements", () => ({
  useGetExperimentsByExperimentIdMeasurements: () => ({
    data: [
      {
        id: "m1",
        measurementDefinitionId: "d1",
        definitionName: "pH",
        valueType: "NUMERIC",
        numericValue: 7.2,
        unit: "",
        categoricalValue: null,
        textValue: null,
        notes: "looks normal",
        recordedAt: "2026-01-01T00:00:00.000Z",
        recordedById: null,
      },
    ],
  }),
}));

vi.mock("@/generated/hooks/experiments/useGetExperimentsByExperimentIdSamples", () => ({
  useGetExperimentsByExperimentIdSamples: () => ({
    data: [{ id: "s1", code: "SMP-001", specimenType: "Serum", storageLocation: null }],
  }),
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectId", () => ({
  useGetProjectsByProjectId: () => ({ data: { title: "Water Project" } }),
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectIdExperiments", () => ({
  useGetProjectsByProjectIdExperiments: () => ({
    data: [
      { id: "e1", title: "Exp One", status: "ACTIVE", previousExperimentId: "e0" },
      { id: "e0", title: "Baseline Study", status: "COMPLETED", previousExperimentId: null },
      { id: "e2", title: "Replication Run", status: "PLANNING", previousExperimentId: "e1" },
    ],
  }),
}));

vi.mock("@/features/measurements/components/create-measurement-form", () => ({
  CreateMeasurementForm: () => null,
}));

import { ExperimentDetailPage } from "./experiment-detail";

describe("ExperimentDetailPage", () => {
  beforeEach(() => {
    experimentData.mockReturnValue({
      data: {
        id: "e1",
        title: "Exp One",
        hypothesis: "pH rises over time",
        status: "ACTIVE",
        projectId: "p1",
        previousExperimentId: "e0",
        startDate: null,
        endDate: null,
      },
      isLoading: false,
      isError: false,
    });
  });

  it("should show a loading state", () => {
    experimentData.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderWithProviders(<ExperimentDetailPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should show an error state", () => {
    experimentData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<ExperimentDetailPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load/i);
  });

  it("should render the experiment header, project link and hypothesis", () => {
    renderWithProviders(<ExperimentDetailPage />);
    expect(screen.getByRole("heading", { name: "Exp One", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Water Project" })).toBeInTheDocument();
    expect(screen.getByText(/ph rises over time/i)).toBeInTheDocument();
  });

  it("should resolve the follow-up to the previous experiment title", () => {
    renderWithProviders(<ExperimentDetailPage />);
    expect(screen.getByText("Baseline Study")).toBeInTheDocument();
  });

  it("should list the linked samples and the follow-up experiments", () => {
    renderWithProviders(<ExperimentDetailPage />);
    expect(screen.getByRole("link", { name: "SMP-001" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Replication Run" })).toBeInTheDocument();
  });

  it("should render a measurement row", () => {
    renderWithProviders(<ExperimentDetailPage />);
    expect(screen.getByText("pH")).toBeInTheDocument();
    expect(screen.getByText("looks normal")).toBeInTheDocument();
  });
});
