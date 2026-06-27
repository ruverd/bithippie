import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta = {
  title: "UI/Select",
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select defaultValue="celsius">
      <SelectTrigger className="w-48" aria-label="Unit">
        <SelectValue placeholder="Select a unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="celsius">Celsius</SelectItem>
        <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
        <SelectItem value="kelvin">Kelvin</SelectItem>
      </SelectContent>
    </Select>
  ),
};
