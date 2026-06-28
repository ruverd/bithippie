import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TitledCard } from "./titled-card";

describe("TitledCard", () => {
  it("should renders the title and children", () => {
    render(
      <TitledCard title="Experiments">
        <p>panel body</p>
      </TitledCard>,
    );
    expect(screen.getByText("Experiments")).toBeInTheDocument();
    expect(screen.getByText("panel body")).toBeInTheDocument();
  });
});
