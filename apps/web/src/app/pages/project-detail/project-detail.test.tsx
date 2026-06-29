import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";

const projectData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectId", () => ({
  useGetProjectsByProjectId: () => projectData(),
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectIdResearchers", () => ({
  useGetProjectsByProjectIdResearchers: () => ({
    data: [
      { researcherId: "r1", name: "Dr. Vega", email: "vega@lab.dev", projectRole: "LEAD" },
    ],
  }),
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectIdExperiments", () => ({
  useGetProjectsByProjectIdExperiments: () => ({
    data: [{ id: "e1", title: "Exp One", status: "ACTIVE", previousExperimentId: null }],
  }),
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectIdSamples", () => ({
  useGetProjectsByProjectIdSamples: () => ({
    data: [{ id: "s1", code: "SMP-001", specimenType: "Serum", collectedAt: null, storageLocation: null }],
  }),
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectIdMeasurements", () => ({
  useGetProjectsByProjectIdMeasurements: () => ({
    data: [
      {
        id: "m1",
        definitionName: "pH",
        experimentName: "Exp One",
        valueType: "NUMERIC",
        numericValue: 7.2,
        unit: "",
        categoricalValue: null,
        textValue: null,
      },
    ],
  }),
}));

vi.mock("@/features/projects/components/project-form-dialog", () => ({ ProjectFormDialog: () => null }));
vi.mock("@/features/experiments/components/experiment-form-dialog", () => ({ ExperimentFormDialog: () => null }));
vi.mock("@/features/samples/components/sample-form-dialog", () => ({ SampleFormDialog: () => null }));
vi.mock("@/features/projects/components/project-researchers-tab", () => ({ ProjectResearchersTab: () => null }));

import { ProjectDetailPage } from "./project-detail";

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    projectData.mockReturnValue({
      data: {
        title: "Water Project",
        status: "ACTIVE",
        description: "Soil microbiome work",
        createdAt: "2026-01-01T00:00:00.000Z",
        leadName: "Dr. Vega",
        experimentCount: 1,
      },
      isLoading: false,
      isError: false,
    });
  });

  it("should show a loading state", () => {
    projectData.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderWithProviders(<ProjectDetailPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should show an error state", () => {
    projectData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<ProjectDetailPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load project/i);
  });

  it("should render the header, the experiment link and a team member", () => {
    renderWithProviders(<ProjectDetailPage />);
    expect(screen.getByRole("heading", { name: "Water Project", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Exp One" })).toBeInTheDocument();
    expect(screen.getAllByText("Dr. Vega").length).toBeGreaterThan(0);
  });
});
