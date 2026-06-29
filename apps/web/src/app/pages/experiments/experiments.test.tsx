import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const experimentsData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/experiments/useGetExperiments", () => ({
  useGetExperiments: () => experimentsData(),
}));

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  useGetProjects: () => ({ data: [{ id: "p1", title: "Water Project" }] }),
}));

vi.mock("@/features/experiments/components/experiment-form-dialog", () => ({
  ExperimentFormDialog: () => null,
}));

import { ExperimentsPage } from "./experiments";

const experiment = {
  id: "e1",
  title: "Exp One",
  hypothesis: "pH rises over time",
  projectName: "Water Project",
  projectId: "p1",
  status: "ACTIVE",
  leadName: "Dr. Vega",
  measurementCount: 3,
  startDate: "2026-01-01T00:00:00.000Z",
};

describe("ExperimentsPage", () => {
  beforeEach(() => {
    experimentsData.mockReturnValue({ data: [experiment], isLoading: false, isError: false });
  });

  it("should render the heading and an experiment row", () => {
    renderWithProviders(<ExperimentsPage />);
    expect(screen.getByRole("heading", { name: "Experiments", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Exp One")).toBeInTheDocument();
  });

  it("should show an error state", () => {
    experimentsData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<ExperimentsPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load experiments/i);
  });

  it("should filter out rows that do not match the search", async () => {
    renderWithProviders(<ExperimentsPage />);
    await userEvent.type(screen.getByPlaceholderText(/search experiments/i), "zzz");
    expect(screen.queryByText("Exp One")).not.toBeInTheDocument();
  });
});
