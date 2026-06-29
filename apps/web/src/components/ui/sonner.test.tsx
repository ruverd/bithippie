import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toaster } from "./sonner";

describe("Toaster", () => {
  it("should render the sonner notifications region", () => {
    render(<Toaster />);
    expect(screen.getByLabelText(/Notifications/)).toBeInTheDocument();
  });
});
