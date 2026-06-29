import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ChipMultiSelect } from "./chip-multi-select";

const options = [
  { id: "vega", label: "Dr. Vega" },
  { id: "lin", label: "Dr. Lin" },
  { id: "okafor", label: "Dr. Okafor" },
];

const meta = {
  title: "Components/ChipMultiSelect",
  component: ChipMultiSelect,
  args: { value: [], onChange: () => {}, options },
} satisfies Meta<typeof ChipMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["vega"]);
    return <ChipMultiSelect value={value} onChange={setValue} options={options} />;
  },
};

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <ChipMultiSelect value={value} onChange={setValue} options={options} />;
  },
};
