import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipMultiSelect } from "./chip-multi-select";

const options = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
];

describe("ChipMultiSelect", () => {
  it("should render a chip for each selected value", () => {
    render(<ChipMultiSelect value={["a"]} options={options} onChange={() => {}} />);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  it("should remove a value when its remove button is clicked", async () => {
    const onChange = vi.fn();
    render(<ChipMultiSelect value={["a", "b"]} options={options} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Alpha" }));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });

  it("should show the add placeholder while options remain", () => {
    render(<ChipMultiSelect value={["a"]} options={options} onChange={() => {}} />);
    expect(screen.getByText("+ Add")).toBeInTheDocument();
  });

  it("should hide the add select when every option is selected", () => {
    render(<ChipMultiSelect value={["a", "b"]} options={options} onChange={() => {}} />);
    expect(screen.queryByText("+ Add")).not.toBeInTheDocument();
  });
});
