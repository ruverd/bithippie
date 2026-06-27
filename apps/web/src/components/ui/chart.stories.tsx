import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "./chart";

const data = [
  { month: "Jan", samples: 120 },
  { month: "Feb", samples: 180 },
  { month: "Mar", samples: 90 },
  { month: "Apr", samples: 210 },
];

const config = {
  samples: { label: "Samples", color: "#2563eb" },
} satisfies ChartConfig;

const meta = {
  title: "UI/Chart",
  component: ChartContainer,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
  args: {
    config,
    children: (
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <Bar dataKey="samples" fill="var(--color-samples)" radius={4} />
      </BarChart>
    ),
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Bars: Story = {};
