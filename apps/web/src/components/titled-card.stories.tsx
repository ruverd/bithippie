import type { Meta, StoryObj } from "@storybook/react-vite";
import { TitledCard } from "./titled-card";

const meta = {
  title: "Components/TitledCard",
  component: TitledCard,
  args: {
    title: "Overview",
    children: (
      <div className="px-4 py-3.5 text-sm text-muted-foreground">Card body content.</div>
    ),
  },
} satisfies Meta<typeof TitledCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
