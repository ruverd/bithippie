import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta = {
  title: "UI/Sheet",
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
      <SheetDescription>Refine the sample list.</SheetDescription>
    </SheetHeader>
  </SheetContent>
);

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open sheet</Button>} />
      {content}
    </Sheet>
  ),
};

export const Open: Story = {
  render: () => <Sheet defaultOpen>{content}</Sheet>,
};
