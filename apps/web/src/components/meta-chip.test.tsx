import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetaChip } from "./meta-chip";

describe("MetaChip", () => {
  it("should renders the label and value", () => {
    render(<MetaChip label="Status" value="Active" />);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
