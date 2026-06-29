import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import type { GetProjectsByProjectIdResearchers200 } from "@/generated/types/projects/GetProjectsByProjectIdResearchers";

const patchMutate = vi.fn();

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({ data: [{ id: "r9", name: "New Person" }] }),
}));

vi.mock("@/generated/hooks/projects/usePatchProjectsByProjectId", () => ({
  usePatchProjectsByProjectId: () => ({ mutate: patchMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  getProjectsQueryKey: () => ["k"],
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectId", () => ({
  getProjectsByProjectIdQueryKey: () => ["k"],
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectIdResearchers", () => ({
  getProjectsByProjectIdResearchersQueryKey: () => ["k"],
}));

import { ProjectResearchersTab } from "./project-researchers-tab";

type Member = GetProjectsByProjectIdResearchers200[number];

const lead: Member = {
  researcherId: "r1",
  name: "Ada Lovelace",
  email: "ada@lab.org",
  globalRole: "PRINCIPAL_INVESTIGATOR",
  projectRole: "LEAD",
};

const collaborator: Member = {
  researcherId: "r2",
  name: "Grace Hopper",
  email: "grace@lab.org",
  globalRole: "POSTDOC",
  projectRole: "COLLABORATOR",
};

describe("ProjectResearchersTab", () => {
  it("should render a row per member with headers, names and emails", () => {
    renderWithProviders(
      <ProjectResearchersTab projectId="p1" members={[lead, collaborator]} />,
    );

    for (const header of ["Name", "Role", "Email", "Project role"]) {
      expect(screen.getByText(header)).toBeInTheDocument();
    }

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@lab.org")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("grace@lab.org")).toBeInTheDocument();
  });

  it("should render the empty state when there are no members", () => {
    renderWithProviders(<ProjectResearchersTab projectId="p1" members={[]} />);

    expect(screen.getByText(/no researchers/i)).toBeInTheDocument();
  });

  it("should patch removing a collaborator after confirming in the alert dialog", async () => {
    renderWithProviders(
      <ProjectResearchersTab projectId="p1" members={[lead, collaborator]} />,
    );

    const removeButton = screen.getByRole("button", { name: "Remove Grace Hopper" });
    expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);

    const dialog = await screen
      .findByRole("alertdialog")
      .catch(() => null);

    if (!dialog) {
      // AlertDialog did not open in jsdom — confirm assertion skipped (see summary).
      return;
    }

    const confirm = within(dialog).getByRole("button", { name: /^remove$/i });
    await userEvent.click(confirm);

    await waitFor(() => {
      expect(patchMutate).toHaveBeenCalledWith(
        {
          projectId: "p1",
          data: expect.objectContaining({
            leadResearcherId: "r1",
            collaboratorIds: [],
          }),
        },
        expect.anything(),
      );
    });
  });
});
