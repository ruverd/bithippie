import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

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

// TODO: bind to stats endpoint
export const EXPERIMENTS_STATUS_PLACEHOLDER: ExperimentStatusItem[] = [
  { status: "Active", count: 7, color: "var(--chart-1)" },
  { status: "Completed", count: 5, color: "var(--chart-2)" },
  { status: "Planning", count: 4, color: "var(--chart-3)" },
  { status: "Cancelled", count: 2, color: "var(--chart-4)" },
];

export function ExperimentsStatusDonut({ data, total }: ExperimentsStatusDonutProps) {
  return (
    <Card className="flex w-[380px] shrink-0 flex-col p-5">
      <CardHeader className="p-0 pb-4">
        <p className="text-base font-semibold">Experiments by Status</p>
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-5 p-0">
        <div className="relative">
          <ChartContainer config={chartConfig} className="size-[160px]">
            <PieChart>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold">{total}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
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
