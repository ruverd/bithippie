import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  it("should keeps the content closed until triggered", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Heading</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.queryByText("Heading")).not.toBeInTheDocument();
  });

  it("should renders the content when open by default", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Heading</DialogTitle>
          <DialogDescription>Details</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });
});
