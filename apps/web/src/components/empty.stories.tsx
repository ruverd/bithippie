import type { Meta, StoryObj } from "@storybook/react-vite";
import { Empty } from "./empty";

const meta = {
  title: "Components/Empty",
  component: Empty,
  args: { children: "No experiments yet." },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
