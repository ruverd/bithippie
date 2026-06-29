import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";

const sampleData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/samples/useGetSamplesBySampleId", () => ({
  useGetSamplesBySampleId: () => sampleData(),
}));

import { SampleDetailPage } from "./sample-detail";

describe("SampleDetailPage", () => {
  beforeEach(() => {
    sampleData.mockReturnValue({
      data: { id: "s1", code: "SMP-001", specimenType: "Serum" },
      isLoading: false,
      isError: false,
    });
  });

  it("should show a loading state", () => {
    sampleData.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    renderWithProviders(<SampleDetailPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should show an error state", () => {
    sampleData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<SampleDetailPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load sample/i);
  });

  it("should show a not-found state when there is no data", () => {
    sampleData.mockReturnValue({ data: null, isLoading: false, isError: false });
    renderWithProviders(<SampleDetailPage />);
    expect(screen.getByText(/no sample found/i)).toBeInTheDocument();
  });

  it("should render the sample as JSON when present", () => {
    const { container } = renderWithProviders(<SampleDetailPage />);
    expect(container.querySelector("pre")?.textContent).toContain('"code": "SMP-001"');
  });
});
