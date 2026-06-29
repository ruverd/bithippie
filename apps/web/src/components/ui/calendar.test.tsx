import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("should render the month grid and caption", () => {
    render(<Calendar mode="single" defaultMonth={new Date(2026, 5, 1)} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("June 2026")).toBeInTheDocument();
  });

  it("should call onSelect when a day is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <Calendar mode="single" defaultMonth={new Date(2026, 5, 1)} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByText("15"));
    expect(onSelect).toHaveBeenCalled();
  });
});
