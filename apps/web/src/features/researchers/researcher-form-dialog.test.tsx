import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const createMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  useGetProjects: () => ({ data: [{ id: "p1", title: "Project One" }] }),
}));

vi.mock("@/generated/hooks/researchers/usePostResearchers", () => ({
  usePostResearchers: () => ({ mutate: createMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/researchers/usePatchResearchersByResearcherId", () => ({
  usePatchResearchersByResearcherId: () => ({ mutate: updateMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  getResearchersQueryKey: () => ["researchers"],
}));

import { ResearcherFormDialog } from "./researcher-form-dialog";

const noop = () => {};

describe("ResearcherFormDialog", () => {
  it("should not render the dialog heading when open is false", () => {
    renderWithProviders(<ResearcherFormDialog open={false} onOpenChange={noop} />);
    expect(screen.queryByText(/new researcher/i)).not.toBeInTheDocument();
  });

  it("should render create mode with name, email, project fields and a create button", () => {
    renderWithProviders(<ResearcherFormDialog open onOpenChange={noop} />);

    expect(screen.getByText(/new researcher/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@lab.org")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create researcher/i })).toBeInTheDocument();
    expect(screen.getByText(/assign to project/i)).toBeInTheDocument();
    expect(screen.getByText(/project role/i)).toBeInTheDocument();
  });

  it("should show required and email errors and not call create when submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResearcherFormDialog open onOpenChange={noop} />);

    await user.click(screen.getByRole("button", { name: /create researcher/i }));

    expect((await screen.findAllByText(/required/i)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("should show an invalid-email error when an invalid email is typed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResearcherFormDialog open onOpenChange={noop} />);

    await user.type(screen.getByPlaceholderText("Full name"), "Grace");
    await user.type(screen.getByPlaceholderText("name@lab.org"), "not-an-email");
    // Submit via the form element (which base-ui portals into document.body):
    // a button click triggers jsdom's native type="email" constraint
    // validation, which blocks the submit event and prevents react-hook-form
    // (and therefore the zod resolver) from running.
    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("should render edit mode with pre-filled name, save button and no project block", async () => {
    renderWithProviders(
      <ResearcherFormDialog
        open
        onOpenChange={noop}
        researcher={{ id: "r1", name: "Ada", email: "ada@lab.org", globalRole: "POSTDOC" }}
      />,
    );

    expect(screen.getByText(/edit researcher/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.queryByText(/assign to project/i)).not.toBeInTheDocument();
    expect(await screen.findByDisplayValue("Ada")).toBeInTheDocument();
  });

  it("should submit the patch mutation in edit mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ResearcherFormDialog
        open
        onOpenChange={noop}
        researcher={{ id: "r1", name: "Ada", email: "ada@lab.org", globalRole: "POSTDOC" }}
      />,
    );

    const nameInput = await screen.findByDisplayValue("Ada");
    await user.clear(nameInput);
    await user.type(nameInput, "Ada Lovelace");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(updateMutate).toHaveBeenCalledWith(
        {
          researcherId: "r1",
          data: expect.objectContaining({
            name: "Ada Lovelace",
            email: "ada@lab.org",
            globalRole: "POSTDOC",
          }),
        },
        expect.anything(),
      );
    });
  });
});
