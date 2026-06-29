import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";

type Experiment = GetExperiments200[number];

const STATUS_ORDER = ["ACTIVE", "COMPLETED", "PLANNING", "CANCELLED"] as const;
const STATUS_META: Record<(typeof STATUS_ORDER)[number], { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "var(--chart-1)" },
  COMPLETED: { label: "Completed", color: "var(--chart-2)" },
  PLANNING: { label: "Planning", color: "var(--chart-3)" },
  CANCELLED: { label: "Cancelled", color: "var(--chart-4)" },
};

export interface StatusBreakdown {
  items: { status: string; count: number; color: string }[];
  total: number;
}

export function experimentsByStatus(experiments: Experiment[]): StatusBreakdown {
  const counts = new Map<string, number>();
  for (const e of experiments) {
    if (e.status && e.status in STATUS_META) {
      counts.set(e.status, (counts.get(e.status) ?? 0) + 1);
    }
  }
  const items = STATUS_ORDER.filter((status) => (counts.get(status) ?? 0) > 0).map((status) => ({
    status: STATUS_META[status].label,
    count: counts.get(status) ?? 0,
    color: STATUS_META[status].color,
  }));
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return { items, total };
}
