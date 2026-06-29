import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";

const definitionsData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/measurementDefinitions/useGetMeasurementDefinitions", () => ({
  useGetMeasurementDefinitions: () => definitionsData(),
}));

import { MeasurementDefinitionsPage } from "./measurement-definitions";

describe("MeasurementDefinitionsPage", () => {
  beforeEach(() => {
    definitionsData.mockReturnValue({ data: [], isLoading: false, isError: false });
  });

  it("should show a loading state", () => {
    definitionsData.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderWithProviders(<MeasurementDefinitionsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should show an error state", () => {
    definitionsData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<MeasurementDefinitionsPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load measurement definitions/i);
  });

  it("should show an empty state", () => {
    renderWithProviders(<MeasurementDefinitionsPage />);
    expect(screen.getByText(/no measurement definitions/i)).toBeInTheDocument();
  });

  it("should render the definitions as JSON when present", () => {
    definitionsData.mockReturnValue({
      data: [{ id: "d1", name: "pH", valueType: "NUMERIC" }],
      isLoading: false,
      isError: false,
    });
    const { container } = renderWithProviders(<MeasurementDefinitionsPage />);
    expect(container.querySelector("pre")?.textContent).toContain('"name": "pH"');
  });
});
