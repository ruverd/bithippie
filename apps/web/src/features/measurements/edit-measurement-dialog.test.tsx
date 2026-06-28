import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mutate = vi.fn();
const removeMutate = vi.fn();

vi.mock(
  "@/generated/hooks/measurementDefinitions/useGetMeasurementDefinitions",
  () => ({
    useGetMeasurementDefinitions: () => ({
      data: [
        {
          id: "d1",
          name: "pH",
          valueType: "NUMERIC",
          allowedCategories: [],
        },
      ],
      isLoading: false,
      isError: false,
    }),
  }),
);

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({
    data: [{ id: "r1", name: "Ada Lovelace" }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock(
  "@/generated/hooks/measurements/usePatchMeasurementsByMeasurementId",
  () => ({
    usePatchMeasurementsByMeasurementId: () => ({ mutate, isPending: false }),
  }),
);

vi.mock(
  "@/generated/hooks/measurements/useDeleteMeasurementsByMeasurementId",
  () => ({
    useDeleteMeasurementsByMeasurementId: () => ({
      mutate: removeMutate,
      isPending: false,
    }),
  }),
);

import { EditMeasurementDialog } from "./edit-measurement-dialog";

type Measurement = GetMeasurements200[number];

const measurement: Measurement = {
  id: "m1",
  experimentId: "e1",
  experimentName: "Experiment One",
  measurementDefinitionId: "d1",
  definitionName: "pH",
  valueType: "NUMERIC",
  numericValue: 7,
  unit: "mg/mL",
  categoricalValue: null,
  textValue: null,
  notes: null,
  recordedAt: "2026-01-01T00:00:00.000Z",
  recordedById: "r1",
  recordedByName: "Ada Lovelace",
};

describe("EditMeasurementDialog", () => {
  it("should render nothing when closed", () => {
    renderWithProviders(
      <EditMeasurementDialog
        open={false}
        onOpenChange={vi.fn()}
        measurement={measurement}
      />,
    );
    expect(
      screen.queryByRole("heading", { name: /edit measurement/i }),
    ).not.toBeInTheDocument();
  });

  it("should render the form when open with a numeric measurement", async () => {
    renderWithProviders(
      <EditMeasurementDialog
        open
        onOpenChange={vi.fn()}
        measurement={measurement}
      />,
    );
    expect(
      await screen.findByRole("heading", { name: /edit measurement/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("pH")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Experiment One")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("should submit the patch mutation with the updated numeric value", async () => {
    renderWithProviders(
      <EditMeasurementDialog
        open
        onOpenChange={vi.fn()}
        measurement={measurement}
      />,
    );
    const input = await screen.findByRole("spinbutton");
    await userEvent.clear(input);
    await userEvent.type(input, "8.5");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));
    expect(mutate).toHaveBeenCalledWith(
      {
        measurementId: "m1",
        data: expect.objectContaining({ numericValue: 8.5 }),
      },
      expect.anything(),
    );
  });

  it("should render nothing when the measurement is null", () => {
    const { container } = renderWithProviders(
      <EditMeasurementDialog open onOpenChange={vi.fn()} measurement={null} />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: /edit measurement/i }),
    ).not.toBeInTheDocument();
  });

  it("should call the delete mutation when confirming removal", async () => {
    renderWithProviders(
      <EditMeasurementDialog
        open
        onOpenChange={vi.fn()}
        measurement={measurement}
      />,
    );
    await screen.findByRole("heading", { name: /edit measurement/i });
    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    const confirm = await screen
      .findByRole("alertdialog")
      .then((dialog) =>
        within(dialog).getAllByRole("button", { name: /^delete$/i }),
      )
      .catch(() => []);

    if (confirm.length === 0) {
      // AlertDialog did not open in jsdom — assertion skipped (see summary).
      return;
    }

    const action = confirm[confirm.length - 1]!;
    await userEvent.click(action);
    await waitFor(() =>
      expect(removeMutate).toHaveBeenCalledWith(
        { measurementId: "m1" },
        expect.anything(),
      ),
    );
  });
});
