import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const mutate = vi.fn();

vi.mock(
  "@/generated/hooks/measurementDefinitionsController/useGetMeasurementDefinitions",
  () => ({
    useGetMeasurementDefinitions: () => ({
      data: [
        {
          id: "def-screen",
          name: "Screening",
          valueType: "CATEGORICAL",
          allowedCategories: ["positive", "negative"],
        },
      ],
      isLoading: false,
      isError: false,
    }),
  }),
);

vi.mock(
  "@/generated/hooks/measurementsController/usePostExperimentsByExperimentIdMeasurements",
  () => ({
    usePostExperimentsByExperimentIdMeasurements: () => ({
      mutate,
      isPending: false,
    }),
  }),
);

import { CreateMeasurementForm } from "./create-measurement-form";

describe("CreateMeasurementForm", () => {
  it("shows the categorical field after selecting a categorical definition", async () => {
    renderWithProviders(<CreateMeasurementForm experimentId="e1" />);
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /definition/i }),
      "def-screen",
    );
    expect(screen.getByRole("option", { name: "positive" })).toBeInTheDocument();
  });

  it("submits the measurement via the generated mutation", async () => {
    renderWithProviders(<CreateMeasurementForm experimentId="e1" />);
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /definition/i }),
      "def-screen",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /value/i }),
      "positive",
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(mutate).toHaveBeenCalledWith(
      { experimentId: "e1", data: expect.objectContaining({ measurementDefinitionId: "def-screen", categoricalValue: "positive" }) },
      expect.anything(),
    );
  });
});
