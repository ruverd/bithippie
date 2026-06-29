import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface ExperimentStatusItem {
  status: string;
  count: number;
  color: string;
}

interface ExperimentsStatusDonutProps {
  data: ExperimentStatusItem[];
  total: number;
}

const chartConfig = {
  Active: { label: "Active", color: "var(--chart-1)" },
  Completed: { label: "Completed", color: "var(--chart-2)" },
  Planning: { label: "Planning", color: "var(--chart-3)" },
  Cancelled: { label: "Cancelled", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function ExperimentsStatusDonut({ data, total }: ExperimentsStatusDonutProps) {
  return (
    <Card className="flex w-[380px] shrink-0 flex-col p-5">
      <CardHeader className="p-0 pb-4">
        <p className="text-base font-semibold">Experiments by Status</p>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-5 p-0">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <ChartContainer config={chartConfig} className="relative z-10 size-[160px]">
            <PieChart>
              <ChartTooltip
                isAnimationActive={false}
                content={<ChartTooltipContent nameKey="status" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={58}
                outerRadius={75}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {data.map((entry) => (
            <div key={entry.status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.status}</span>
              </div>
              <span className="text-sm font-semibold">{entry.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
