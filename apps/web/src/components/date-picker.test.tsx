import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("should show the placeholder when no value is set", () => {
    render(<DatePicker onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Pick a date" })).toBeInTheDocument();
  });

  it("should show a custom placeholder", () => {
    render(<DatePicker placeholder="Start date" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Start date" })).toBeInTheDocument();
  });

  it("should show the formatted date when a value is set", () => {
    render(<DatePicker value="2026-06-29" onChange={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent("Jun 29, 2026");
  });
});
