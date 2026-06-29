import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { ExperimentsStatusDonut } from "./experiments-status-donut";

const sampleData = [
  { status: "Active", count: 5, color: "var(--chart-1)" },
  { status: "Completed", count: 3, color: "var(--chart-2)" },
  { status: "Planning", count: 2, color: "var(--chart-3)" },
];

describe("ExperimentsStatusDonut", () => {
  it("should render the section heading", () => {
    renderWithProviders(<ExperimentsStatusDonut data={sampleData} total={10} />);
    expect(screen.getByText("Experiments by Status")).toBeInTheDocument();
  });

  it("should render the total in the center", () => {
    renderWithProviders(<ExperimentsStatusDonut data={sampleData} total={10} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("should render a legend entry with name and count for each status", () => {
    renderWithProviders(<ExperimentsStatusDonut data={sampleData} total={10} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Planning")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should render a zero total with no legend entries", () => {
    renderWithProviders(<ExperimentsStatusDonut data={[]} total={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });
});
