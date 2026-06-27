import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete sample</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter showCloseButton>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
);

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open dialog</Button>} />
      {content}
    </Dialog>
  ),
};

export const Open: Story = {
  render: () => <Dialog defaultOpen>{content}</Dialog>,
};
