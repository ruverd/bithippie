import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

describe("Sheet", () => {
  it("should keeps the content closed until triggered", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.queryByText("Panel")).not.toBeInTheDocument();
  });

  it("should renders the content when open by default", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Panel</SheetTitle>
          <SheetDescription>Details</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Panel")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });
});
