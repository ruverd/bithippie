import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const measurementsData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/measurements/useGetMeasurements", () => ({
  useGetMeasurements: () => measurementsData(),
}));

vi.mock("@/features/measurements/components/create-measurement-dialog", () => ({
  CreateMeasurementDialog: () => null,
}));

vi.mock("@/features/measurements/components/edit-measurement-dialog", () => ({
  EditMeasurementDialog: () => null,
}));

import { MeasurementsPage } from "./measurements";

const measurement = {
  id: "m1",
  definitionName: "pH",
  valueType: "NUMERIC",
  numericValue: 7.2,
  unit: "",
  categoricalValue: null,
  textValue: null,
  experimentName: "Exp One",
  experimentId: "e1",
  recordedByName: "Dr. Vega",
  recordedAt: "2026-01-01T00:00:00.000Z",
};

describe("MeasurementsPage", () => {
  beforeEach(() => {
    measurementsData.mockReturnValue({ data: [measurement], isLoading: false, isError: false });
  });

  it("should render the heading and a measurement row", () => {
    renderWithProviders(<MeasurementsPage />);
    expect(screen.getByRole("heading", { name: "Measurements", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("pH")).toBeInTheDocument();
  });

  it("should show an error state", () => {
    measurementsData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<MeasurementsPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load measurements/i);
  });

  it("should filter out rows that do not match the search", async () => {
    renderWithProviders(<MeasurementsPage />);
    await userEvent.type(screen.getByPlaceholderText(/search measurements/i), "zzz");
    expect(screen.queryByText("pH")).not.toBeInTheDocument();
  });
});
