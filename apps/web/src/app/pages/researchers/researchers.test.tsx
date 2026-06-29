import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";

const researchersData = vi.fn<() => { data: unknown; isLoading: boolean; isError: boolean }>();

vi.mock("@/generated/hooks/researchers/useGetResearchers", () => ({
  useGetResearchers: () => researchersData(),
}));

vi.mock("@/features/researchers/components/researcher-form-dialog", () => ({
  ResearcherFormDialog: () => null,
}));

import { ResearchersPage } from "./researchers";

const researcher = {
  id: "r1",
  name: "Dr. Vega",
  globalRole: "POSTDOC",
  email: "vega@lab.dev",
  projectCount: 2,
  measurementCount: 5,
};

describe("ResearchersPage", () => {
  beforeEach(() => {
    researchersData.mockReturnValue({ data: [researcher], isLoading: false, isError: false });
  });

  it("should render the heading and a researcher row", () => {
    renderWithProviders(<ResearchersPage />);
    expect(screen.getByRole("heading", { name: "Researchers", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Dr. Vega")).toBeInTheDocument();
  });

  it("should show an error state", () => {
    researchersData.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWithProviders(<ResearchersPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load researchers/i);
  });

  it("should filter out rows that do not match the search", async () => {
    renderWithProviders(<ResearchersPage />);
    await userEvent.type(screen.getByPlaceholderText(/search researchers/i), "zzz");
    expect(screen.queryByText("Dr. Vega")).not.toBeInTheDocument();
  });
});
