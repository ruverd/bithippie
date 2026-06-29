import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { MeasurementsBarChart } from "./measurements-bar-chart";

const sampleData = [
  { m: "Jan", v: 10 },
  { m: "Feb", v: 24 },
  { m: "Mar", v: 18 },
];

describe("MeasurementsBarChart", () => {
  it("should render the header title", () => {
    renderWithProviders(<MeasurementsBarChart data={sampleData} />);
    expect(screen.getByText("Measurements Recorded")).toBeInTheDocument();
  });

  it("should render the time-range subtitle", () => {
    renderWithProviders(<MeasurementsBarChart data={sampleData} />);
    expect(screen.getByText("Last 8 months")).toBeInTheDocument();
  });

  it("should render the legend label", () => {
    renderWithProviders(<MeasurementsBarChart data={sampleData} />);
    expect(screen.getByText("Measurements")).toBeInTheDocument();
  });

  it("should render the header text even with no data", () => {
    renderWithProviders(<MeasurementsBarChart data={[]} />);
    expect(screen.getByText("Measurements Recorded")).toBeInTheDocument();
    expect(screen.getByText("Last 8 months")).toBeInTheDocument();
  });
});
