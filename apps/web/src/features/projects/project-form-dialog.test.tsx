import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const createMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({ data: [{ id: "r1", name: "Ada" }, { id: "r2", name: "Lin" }] }),
}));

vi.mock("@/generated/hooks/projects/usePostProjects", () => ({
  usePostProjects: () => ({ mutate: createMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/projects/usePatchProjectsByProjectId", () => ({
  usePatchProjectsByProjectId: () => ({ mutate: updateMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  getProjectsQueryKey: () => ["k"],
}));

vi.mock("@/generated/hooks/projects/useGetProjectsByProjectId", () => ({
  getProjectsByProjectIdQueryKey: () => ["k"],
}));

import { ProjectFormDialog } from "./project-form-dialog";

describe("ProjectFormDialog", () => {
  it("should open the create dialog when the trigger is clicked", async () => {
    renderWithProviders(<ProjectFormDialog trigger={<button>Open</button>} />);

    expect(screen.queryByRole("heading", { name: /new project/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(await screen.findByRole("heading", { name: /new project/i })).toBeInTheDocument();
    expect(screen.getByText(/create a new research project/i)).toBeInTheDocument();
  });

  it("should open in edit mode prefilled with the project title", async () => {
    renderWithProviders(
      <ProjectFormDialog
        trigger={<button>Open</button>}
        projectId="p1"
        initial={{ title: "Existing" }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Open" }));

    expect(await screen.findByRole("heading", { name: /edit project/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing")).toBeInTheDocument();
  });

  it("should show a required error and not call create when title is empty", async () => {
    renderWithProviders(<ProjectFormDialog trigger={<button>Open</button>} />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const titleInput = await screen.findByPlaceholderText("Microbiome Response to Diet");
    await userEvent.clear(titleInput);
    await userEvent.click(screen.getByRole("button", { name: /create project/i }));

    expect(await screen.findByText(/required/i)).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("should call create with the typed title on submit", async () => {
    renderWithProviders(<ProjectFormDialog trigger={<button>Open</button>} />);

    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const titleInput = await screen.findByPlaceholderText("Microbiome Response to Diet");
    await userEvent.type(titleInput, "New Project Title");
    await userEvent.click(screen.getByRole("button", { name: /create project/i }));

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith(
        { data: expect.objectContaining({ title: "New Project Title" }) },
        expect.anything(),
      );
    });
    expect(updateMutate).not.toHaveBeenCalled();
  });
});
