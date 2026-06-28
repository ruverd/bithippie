import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("should renders a separator role", () => {
    render(<Separator />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("should renders when vertical", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.querySelector('[data-slot="separator"]')).toBeInTheDocument();
  });
});
