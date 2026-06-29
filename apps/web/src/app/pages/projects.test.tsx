import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const projectsData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  useGetProjects: () => projectsData(),
}));

vi.mock("@/features/projects/components/project-form-dialog", () => ({
  ProjectFormDialog: () => null,
}));

vi.mock("@/features/projects/components/team-avatars", () => ({
  TeamAvatars: () => null,
}));

import { ProjectsPage } from "./projects";

const project = {
  id: "p1",
  title: "Alpha Study",
  description: "Soil microbiome work",
  status: "ACTIVE",
  team: [],
  experimentCount: 2,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("ProjectsPage", () => {
  beforeEach(() => {
    projectsData.mockReturnValue({ data: [project], isLoading: false, isError: false });
  });

  it("should render the heading and a project row", () => {
    renderWithProviders(<ProjectsPage />);
    expect(screen.getByRole("heading", { name: "Projects", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Alpha Study")).toBeInTheDocument();
  });

  it("should show an error state", () => {
    projectsData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<ProjectsPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load projects/i);
  });

  it("should filter out rows that do not match the search", async () => {
    renderWithProviders(<ProjectsPage />);
    await userEvent.type(screen.getByPlaceholderText(/search projects/i), "zzz");
    expect(screen.queryByText("Alpha Study")).not.toBeInTheDocument();
  });
});
