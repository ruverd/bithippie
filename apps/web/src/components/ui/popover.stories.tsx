import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

const meta = {
  title: "UI/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Filters</PopoverTitle>
      <PopoverDescription>Refine the experiment list.</PopoverDescription>
    </PopoverHeader>
  </PopoverContent>
);

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Open</Button>} />
      {content}
    </Popover>
  ),
};

export const Open: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger render={<Button variant="outline">Open</Button>} />
      {content}
    </Popover>
  ),
};
