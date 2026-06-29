import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

const meta = {
  title: "UI/AlertDialog",
  component: AlertDialog,
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const content = (
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete experiment?</AlertDialogTitle>
      <AlertDialogDescription>
        This permanently removes the experiment and its measurements.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
);

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive">Delete</Button>} />
      {content}
    </AlertDialog>
  ),
};

export const Open: Story = {
  render: () => <AlertDialog defaultOpen>{content}</AlertDialog>,
};
