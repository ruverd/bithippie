import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { StatusBadge } from "./status-badge";

interface Sample {
  id: string;
  name: string;
  status: string;
}

const columns: ColumnDef<Sample, unknown>[] = [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

const data: Sample[] = [
  { id: "1", name: "Sample A", status: "Active" },
  { id: "2", name: "Sample B", status: "Completed" },
  { id: "3", name: "Sample C", status: "Planning" },
];

const TypedDataTable = DataTable<Sample>;

const meta = {
  title: "Components/DataTable",
  component: TypedDataTable,
  args: { columns, data, noun: "samples" },
} satisfies Meta<typeof TypedDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Empty: Story = { args: { data: [] } };
export const ErrorState: Story = { args: { isError: true } };
