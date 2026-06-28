import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { MeasurementValueField } from "./MeasurementValueField";

describe("MeasurementValueField", () => {
  it("should renders a number input for a NUMERIC definition", () => {
    renderWithProviders(
      <MeasurementValueField valueType="NUMERIC" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("should renders a select of allowedCategories for a CATEGORICAL definition", () => {
    renderWithProviders(
      <MeasurementValueField
        valueType="CATEGORICAL"
        allowedCategories={["positive", "negative"]}
        value=""
        onChange={vi.fn()}
      />,
    );
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "positive" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "negative" })).toBeInTheDocument();
  });

  it("should renders a textarea for a TEXT definition", () => {
    renderWithProviders(
      <MeasurementValueField valueType="TEXT" value="" onChange={vi.fn()} />,
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
