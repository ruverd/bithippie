import { describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const createMutate = vi.fn();
const updateMutate = vi.fn();
const removeMutate = vi.fn();
const detailData = vi.fn<() => { data: unknown }>(() => ({ data: undefined }));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/generated/hooks/projects/useGetProjects", () => ({
  useGetProjects: () => ({ data: [{ id: "p1", title: "Project One" }] }),
}));

vi.mock("@/generated/hooks/experiments/usePostExperiments", () => ({
  usePostExperiments: () => ({ mutate: createMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/experiments/usePatchExperimentsByExperimentId", () => ({
  usePatchExperimentsByExperimentId: () => ({ mutate: updateMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/experiments/useDeleteExperimentsByExperimentId", () => ({
  useDeleteExperimentsByExperimentId: () => ({ mutate: removeMutate, isPending: false }),
}));

vi.mock("@/generated/hooks/experiments/useGetExperimentsByExperimentId", () => ({
  useGetExperimentsByExperimentId: (_id: string | undefined, _opts: unknown) => detailData(),
}));

import { ExperimentFormDialog } from "./experiment-form-dialog";

describe("ExperimentFormDialog", () => {
  it("should not render dialog content when open is false", () => {
    detailData.mockReturnValue({ data: undefined });
    renderWithProviders(<ExperimentFormDialog open={false} onOpenChange={vi.fn()} />);
    expect(screen.queryByRole("heading", { name: /new experiment/i })).not.toBeInTheDocument();
  });

  it("should render create-mode UI without a delete button", () => {
    detailData.mockReturnValue({ data: undefined });
    renderWithProviders(<ExperimentFormDialog open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /new experiment/i })).toBeInTheDocument();
    expect(screen.getByText(/add an experiment/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Experiment title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create experiment/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^delete$/i })).not.toBeInTheDocument();
  });

  it("should show a required error and not call create when title is empty", async () => {
    detailData.mockReturnValue({ data: undefined });
    renderWithProviders(<ExperimentFormDialog open onOpenChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: /create experiment/i }));

    expect((await screen.findAllByText(/required/i)).length).toBeGreaterThan(0);
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("should render edit-mode UI prefilled with the experiment title", async () => {
    detailData.mockReturnValue({
      data: {
        id: "e1",
        title: "Exp 1",
        hypothesis: "",
        projectId: "p1",
        status: "ACTIVE",
        startDate: null,
        endDate: null,
      },
    });
    renderWithProviders(
      <ExperimentFormDialog open onOpenChange={vi.fn()} experiment={{ id: "e1", title: "Exp 1" }} />,
    );

    expect(screen.getByRole("heading", { name: /edit experiment/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Exp 1")).toBeInTheDocument();
  });

  it("should delete the experiment after confirming in the alert dialog", async () => {
    detailData.mockReturnValue({
      data: {
        id: "e1",
        title: "Exp 1",
        hypothesis: "",
        projectId: "p1",
        status: "ACTIVE",
        startDate: null,
        endDate: null,
      },
    });
    renderWithProviders(
      <ExperimentFormDialog open onOpenChange={vi.fn()} experiment={{ id: "e1", title: "Exp 1" }} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    const alertdialog = await screen.findByRole("alertdialog");
    const confirm = await within(alertdialog).findByRole("button", { name: /^delete$/i });
    await userEvent.click(confirm);

    expect(removeMutate).toHaveBeenCalledWith(
      { experimentId: "e1" },
      expect.anything(),
    );
  });
});
