import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mutate = vi.fn();

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

vi.mock("@/generated/hooks/experiments/useGetExperiments", () => ({
  useGetExperiments: () => ({
    data: [{ id: "e1", title: "Experiment One" }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => ({
    data: [{ id: "r1", name: "Ada Lovelace" }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock(
  "@/generated/hooks/measurements/usePostExperimentsByExperimentIdMeasurements",
  () => ({
    usePostExperimentsByExperimentIdMeasurements: () => ({
      mutate,
      isPending: false,
    }),
  }),
);

vi.mock(
  "@/generated/hooks/experiments/useGetExperimentsByExperimentIdMeasurements",
  () => ({
    getExperimentsByExperimentIdMeasurementsQueryKey: () => ["k"],
  }),
);

vi.mock("@/generated/hooks/measurements/useGetMeasurements", () => ({
  getMeasurementsQueryKey: () => ["k"],
}));

import { CreateMeasurementDialog } from "./create-measurement-dialog";

describe("CreateMeasurementDialog", () => {
  it("should render the trigger button", () => {
    renderWithProviders(<CreateMeasurementDialog />);
    expect(
      screen.getByRole("button", { name: /new measurement/i }),
    ).toBeInTheDocument();
  });

  it("should open the dialog when the trigger is clicked", async () => {
    renderWithProviders(<CreateMeasurementDialog />);
    await userEvent.click(
      screen.getByRole("button", { name: /new measurement/i }),
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /new measurement/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/record a data point/i)).toBeInTheDocument();
  });
});
