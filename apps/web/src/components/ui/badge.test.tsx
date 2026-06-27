import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies the variant classes", () => {
    render(<Badge variant="secondary">New</Badge>);
    expect(screen.getByText("New")).toHaveClass("bg-secondary");
  });
});
