import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "./status-badge";

const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  args: { status: "Active" },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};
export const Planning: Story = { args: { status: "Planning" } };
export const Completed: Story = { args: { status: "Completed" } };
export const Cancelled: Story = { args: { status: "Cancelled" } };
export const OnHold: Story = { args: { status: "On Hold" } };
