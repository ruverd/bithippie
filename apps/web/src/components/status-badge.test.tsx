import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it.each([
    ["ACTIVE", "Active"],
    ["active", "Active"],
    ["PLANNING", "Planning"],
    ["COMPLETED", "Completed"],
    ["CANCELLED", "Cancelled"],
    ["ON HOLD", "On Hold"],
  ])("normalizes %s to the label %s", (raw, label) => {
    render(<StatusBadge status={raw} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each([null, undefined, "", "something-unknown"])(
    "renders nothing for %s",
    (raw) => {
      const { container } = render(<StatusBadge status={raw} />);
      expect(container).toBeEmptyDOMElement();
    },
  );

  it("applies the variant class for the status", () => {
    render(<StatusBadge status="ACTIVE" />);
    expect(screen.getByText("Active")).toHaveClass("bg-primary");
  });
});
