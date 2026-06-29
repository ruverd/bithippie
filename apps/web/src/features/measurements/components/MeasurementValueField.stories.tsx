import type { Meta, StoryObj } from "@storybook/react-vite";
import { MeasurementValueField } from "./MeasurementValueField";

const meta = {
  title: "Measurements/MeasurementValueField",
  component: MeasurementValueField,
  args: {
    value: "",
    onChange: () => {},
  },
} satisfies Meta<typeof MeasurementValueField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Numeric: Story = {
  args: {
    valueType: "NUMERIC",
    unit: "mg/dL",
    onUnitChange: () => {},
  },
};

export const Categorical: Story = {
  args: {
    valueType: "CATEGORICAL",
    allowedCategories: ["positive", "negative"],
  },
};

export const Text: Story = {
  args: {
    valueType: "TEXT",
  },
};
