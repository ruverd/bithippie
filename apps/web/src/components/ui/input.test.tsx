import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("accepts typed text", async () => {
    render(<Input placeholder="Email" />);
    const input = screen.getByPlaceholderText("Email");
    await userEvent.type(input, "lab@bithippie.dev");
    expect(input).toHaveValue("lab@bithippie.dev");
  });

  it("does not accept input when disabled", async () => {
    render(<Input placeholder="Email" disabled />);
    const input = screen.getByPlaceholderText("Email");
    await userEvent.type(input, "nope");
    expect(input).toHaveValue("");
  });
});
