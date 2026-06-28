import { Bar, BarChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

interface MonthlyCount {
  m: string;
  v: number;
}

interface MeasurementsBarChartProps {
  data: MonthlyCount[];
}

const chartConfig = {
  measurements: {
    label: "Measurements",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function MeasurementsBarChart({ data }: MeasurementsBarChartProps) {
  return (
    <Card className="flex flex-1 flex-col p-5">
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
        <div>
          <p className="text-base font-semibold">Measurements Recorded</p>
          <p className="text-[13px] text-muted-foreground">Last 8 months</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          <span className="text-[13px] text-muted-foreground">Measurements</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="m"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Bar
              dataKey="v"
              fill="var(--color-measurements)"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
