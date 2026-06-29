import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@/components/ui/input";
import { Field } from "./form-field";

const meta = {
  title: "Components/Field",
  component: Field,
  args: {
    label: "Project title",
    children: <Input placeholder="e.g. Soil microbiome study" />,
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const WithError: Story = {
  args: { required: true, error: "Title is required." },
};
