import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableCell, TableRow } from "@/components/ui/table";
import { SimpleTable } from "./simple-table";

const rows = (
  <>
    <TableRow>
      <TableCell>pH</TableCell>
      <TableCell>numeric</TableCell>
      <TableCell>—</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>Temperature</TableCell>
      <TableCell>numeric</TableCell>
      <TableCell>°C</TableCell>
    </TableRow>
  </>
);

const meta = {
  title: "Components/SimpleTable",
  component: SimpleTable,
  args: {
    head: ["Name", "Type", "Unit"],
    empty: false,
    emptyLabel: "No measurements.",
    children: rows,
  },
} satisfies Meta<typeof SimpleTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const EmptyState: Story = { args: { empty: true } };
