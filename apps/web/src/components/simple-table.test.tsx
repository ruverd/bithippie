import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableCell, TableRow } from "@/components/ui/table";
import { SimpleTable } from "./simple-table";

describe("SimpleTable", () => {
  it("should renders the head cells", () => {
    render(
      <SimpleTable head={["Name", "Status"]} empty emptyLabel="No rows.">
        <></>
      </SimpleTable>,
    );
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("should shows the empty label when empty", () => {
    render(
      <SimpleTable head={["Name"]} empty emptyLabel="No rows.">
        <></>
      </SimpleTable>,
    );
    expect(screen.getByText("No rows.")).toBeInTheDocument();
  });

  it("should renders the rows when not empty", () => {
    render(
      <SimpleTable head={["Name"]} empty={false} emptyLabel="No rows.">
        <TableRow>
          <TableCell>Alice</TableCell>
        </TableRow>
      </SimpleTable>,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("No rows.")).not.toBeInTheDocument();
  });
});
