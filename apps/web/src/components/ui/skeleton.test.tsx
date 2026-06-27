import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with its base and custom classes", () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass("animate-pulse", "h-4", "w-10");
  });
});
