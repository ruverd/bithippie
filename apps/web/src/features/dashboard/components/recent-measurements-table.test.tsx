import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { RecentMeasurementsTable } from "./recent-measurements-table";

describe("RecentMeasurementsTable", () => {
  it("should render the header and column titles", () => {
    renderWithProviders(<RecentMeasurementsTable rows={[]} />);
    expect(screen.getByText("Recent Measurements")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Definition" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Experiment" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Value" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Recorded By" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Time" })).toBeInTheDocument();
  });

  it("should render a 'View all' link to the measurements page", () => {
    renderWithProviders(<RecentMeasurementsTable rows={[]} />);
    const link = screen.getByRole("link", { name: /view all/i });
    expect(link).toHaveAttribute("href", "/measurements");
  });

  it("should render an empty state when there are no rows", () => {
    renderWithProviders(<RecentMeasurementsTable rows={[]} />);
    expect(screen.getByText(/no measurements yet/i)).toBeInTheDocument();
  });

  it("should render measurement rows with their values", () => {
    renderWithProviders(
      <RecentMeasurementsTable
        rows={[
          {
            id: "m1",
            definition: "pH Level",
            experiment: "Buffer Test",
            value: "7.4",
            recordedBy: "JD",
            time: "2h ago",
          },
        ]}
      />,
    );
    expect(screen.getByText("pH Level")).toBeInTheDocument();
    expect(screen.getByText("Buffer Test")).toBeInTheDocument();
    expect(screen.getByText("7.4")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
    expect(screen.getAllByText("JD").length).toBeGreaterThan(0);
  });
});
