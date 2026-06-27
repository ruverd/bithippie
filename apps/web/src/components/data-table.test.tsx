import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";

interface Row {
  name: string;
  score: number;
}

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "score", header: "Score" },
];

const data: Row[] = [
  { name: "Beta", score: 2 },
  { name: "Alpha", score: 1 },
  { name: "Gamma", score: 3 },
];

describe("DataTable", () => {
  it("renders a row per data item", () => {
    render(<DataTable columns={columns} data={data} noun="samples" />);
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("renders skeletons while loading", () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} noun="samples" isLoading />,
    );
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length,
    ).toBeGreaterThan(0);
  });

  it("renders an error state", () => {
    render(<DataTable columns={columns} data={[]} noun="samples" isError />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load samples.");
  });

  it("renders an empty state", () => {
    render(<DataTable columns={columns} data={[]} noun="samples" />);
    expect(screen.getByText("No samples.")).toBeInTheDocument();
    expect(screen.getByText("No samples")).toBeInTheDocument();
  });

  it("paginates and disables the boundary buttons", async () => {
    render(
      <DataTable columns={columns} data={data} noun="samples" pageSize={2} />,
    );
    expect(screen.getByText("Showing 1–2 of 3 samples")).toBeInTheDocument();

    const previous = screen.getByRole("button", { name: "Previous" });
    const next = screen.getByRole("button", { name: "Next" });
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();

    await userEvent.click(next);
    expect(screen.getByText("Showing 3–3 of 3 samples")).toBeInTheDocument();
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();
  });

  it("sorts when a sortable header is clicked", async () => {
    render(<DataTable columns={columns} data={data} noun="samples" />);
    await userEvent.click(screen.getByRole("button", { name: "Name" }));

    const alpha = screen.getByText("Alpha");
    const beta = screen.getByText("Beta");
    expect(
      alpha.compareDocumentPosition(beta) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
