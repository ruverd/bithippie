import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DatePicker } from "./date-picker";

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div className="w-64">
        <DatePicker value={value} onChange={setValue} />
      </div>
    );
  },
};

export const Preselected: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("2026-06-29");
    return (
      <div className="w-64">
        <DatePicker value={value} onChange={setValue} />
      </div>
    );
  },
};
