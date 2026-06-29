import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const samplesData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/samples/useGetSamples", () => ({
  useGetSamples: () => samplesData(),
}));

vi.mock("@/features/samples/components/sample-form-dialog", () => ({
  SampleFormDialog: () => null,
}));

import { SamplesPage } from "./samples";

const sample = {
  id: "s1",
  code: "SMP-001",
  specimenType: "Serum",
  collectedAt: "2026-01-01T00:00:00.000Z",
  storageLocation: "Freezer A",
  experimentCount: 1,
};

describe("SamplesPage", () => {
  beforeEach(() => {
    samplesData.mockReturnValue({ data: [sample], isLoading: false, isError: false });
  });

  it("should render the heading and a sample row", () => {
    renderWithProviders(<SamplesPage />);
    expect(screen.getByRole("heading", { name: "Samples", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("SMP-001")).toBeInTheDocument();
  });

  it("should show an error state", () => {
    samplesData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<SamplesPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load samples/i);
  });

  it("should filter out rows that do not match the search", async () => {
    renderWithProviders(<SamplesPage />);
    await userEvent.type(screen.getByPlaceholderText(/search samples/i), "zzz");
    expect(screen.queryByText("SMP-001")).not.toBeInTheDocument();
  });
});
