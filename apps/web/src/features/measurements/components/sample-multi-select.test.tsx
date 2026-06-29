import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { SampleMultiSelect } from "./sample-multi-select";

const options = [
  { id: "s1", code: "SMP-001", specimenType: "Serum" },
  { id: "s2", code: "SMP-002", specimenType: "Blood" },
];

describe("SampleMultiSelect", () => {
  it("should show the disabled hint when disabled", () => {
    renderWithProviders(
      <SampleMultiSelect value={[]} onChange={vi.fn()} options={[]} disabled />,
    );
    expect(screen.getByText(/select an experiment first/i)).toBeInTheDocument();
  });

  it("should show an empty hint when the experiment has no samples", () => {
    renderWithProviders(<SampleMultiSelect value={[]} onChange={vi.fn()} options={[]} />);
    expect(screen.getByText(/no samples/i)).toBeInTheDocument();
  });

  it("should render a chip for each selected sample code", () => {
    renderWithProviders(
      <SampleMultiSelect value={["s1"]} onChange={vi.fn()} options={options} />,
    );
    expect(screen.getByText("SMP-001")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove smp-001/i })).toBeInTheDocument();
  });

  it("should call onChange without the sample when its chip is removed", async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <SampleMultiSelect value={["s1", "s2"]} onChange={onChange} options={options} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /remove smp-001/i }));
    expect(onChange).toHaveBeenCalledWith(["s2"]);
  });
});
