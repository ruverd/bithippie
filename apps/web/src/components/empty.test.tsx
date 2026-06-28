import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Empty } from "./empty";

describe("Empty", () => {
  it("should renders its children", () => {
    render(<Empty>No experiments.</Empty>);
    expect(screen.getByText("No experiments.")).toBeInTheDocument();
  });
});
