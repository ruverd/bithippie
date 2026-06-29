import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("should accept typed text", async () => {
    render(<Textarea placeholder="Notes" />);
    const el = screen.getByPlaceholderText("Notes");
    await userEvent.type(el, "first observation");
    expect(el).toHaveValue("first observation");
  });

  it("should not accept input when disabled", async () => {
    render(<Textarea placeholder="Notes" disabled />);
    const el = screen.getByPlaceholderText("Notes");
    await userEvent.type(el, "nope");
    expect(el).toHaveValue("");
  });
});
