import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { ActiveExperimentsList } from "./active-experiments-list";

describe("ActiveExperimentsList", () => {
  it("should render the section heading", () => {
    renderWithProviders(<ActiveExperimentsList experiments={[]} />);
    expect(screen.getByText("Active Experiments")).toBeInTheDocument();
  });

  it("should render an empty state when there are no experiments", () => {
    renderWithProviders(<ActiveExperimentsList experiments={[]} />);
    expect(screen.getByText(/no active experiments/i)).toBeInTheDocument();
  });

  it("should render each experiment with its project and measurement count", () => {
    renderWithProviders(
      <ActiveExperimentsList
        experiments={[
          { id: "x1", name: "Protein Folding Assay", project: "Alpha Project", measurementCount: 42 },
          { id: "x2", name: "Enzyme Kinetics", project: "Beta Project", measurementCount: 7 },
        ]}
      />,
    );
    expect(screen.getByText("Protein Folding Assay")).toBeInTheDocument();
    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    expect(screen.getByText("42 measurements")).toBeInTheDocument();
    expect(screen.getByText("Enzyme Kinetics")).toBeInTheDocument();
    expect(screen.getByText("Beta Project")).toBeInTheDocument();
    expect(screen.getByText("7 measurements")).toBeInTheDocument();
  });

  it("should not render the empty state when experiments are present", () => {
    renderWithProviders(
      <ActiveExperimentsList
        experiments={[{ id: "x1", name: "Solo", project: "P", measurementCount: 1 }]}
      />,
    );
    expect(screen.queryByText(/no active experiments/i)).not.toBeInTheDocument();
  });
});
