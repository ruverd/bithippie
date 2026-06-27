import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Bar, BarChart } from "recharts";
import { ChartContainer, type ChartConfig } from "./chart";

const config = {
  value: { label: "Value", color: "#2563eb" },
} satisfies ChartConfig;

describe("ChartContainer", () => {
  it("renders the chart wrapper and provides config", () => {
    const { container } = render(
      <ChartContainer config={config}>
        <BarChart data={[{ name: "a", value: 1 }]}>
          <Bar dataKey="value" />
        </BarChart>
      </ChartContainer>,
    );
    expect(container.querySelector('[data-slot="chart"]')).toBeInTheDocument();
  });
});
