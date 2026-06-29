import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

describe("Popover", () => {
  it("should keep the content closed until triggered", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Heading</PopoverTitle>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.queryByText("Heading")).not.toBeInTheDocument();
  });

  it("should render the content when open by default", () => {
    render(
      <Popover defaultOpen>
        <PopoverContent>
          <PopoverTitle>Heading</PopoverTitle>
          <PopoverDescription>Details</PopoverDescription>
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });
});
