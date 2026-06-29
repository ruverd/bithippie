import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetaChip } from "./meta-chip";

const meta = {
  title: "Components/MetaChip",
  component: MetaChip,
  args: { label: "Status", value: "Active" },
} satisfies Meta<typeof MetaChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Lead: Story = { args: { label: "Lead researcher", value: "Dr. Vega" } };
