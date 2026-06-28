import { measurementValue } from "@/utils/measurement-value";
import { initials } from "@/utils/initials";
import { relativeTime } from "@/utils/relative-time";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Project = GetProjects200[number];
type Experiment = GetExperiments200[number];
type Sample = GetSamples200[number];
type Measurement = GetMeasurements200[number];

export interface DashboardStats {
  activeProjects: number;
  runningExperiments: number;
  samplesLogged: number;
  measurements: number;
}

export function statCards(
  projects: Project[],
  experiments: Experiment[],
  samples: Sample[],
  measurements: Measurement[],
): DashboardStats {
  return {
    activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
    runningExperiments: experiments.filter((e) => e.status === "ACTIVE").length,
    samplesLogged: samples.length,
    measurements: measurements.length,
  };
}

export interface MonthlyCount {
  m: string;
  v: number;
}

export function measurementsByMonth(
  measurements: Measurement[],
  now: Date,
  monthsBack = 8,
): MonthlyCount[] {
  const buckets: MonthlyCount[] = [];
  const indexByKey = new Map<string, number>();
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
    indexByKey.set(`${d.getUTCFullYear()}-${d.getUTCMonth()}`, buckets.length);
    buckets.push({ m: d.toLocaleString("en-US", { month: "short" }), v: 0 });
  }
  for (const meas of measurements) {
    const d = new Date(meas.recordedAt);
    if (Number.isNaN(d.getTime())) continue;
    const at = indexByKey.get(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (at !== undefined) buckets[at]!.v += 1;
  }
  return buckets;
}

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
  const items = STATUS_ORDER.filter((s) => (counts.get(s) ?? 0) > 0).map((s) => ({
    status: STATUS_META[s].label,
    count: counts.get(s) ?? 0,
    color: STATUS_META[s].color,
  }));
  const total = items.reduce((sum, it) => sum + it.count, 0);
  return { items, total };
}

export interface RecentMeasurementRow {
  definition: string;
  experiment: string;
  value: string;
  recordedBy: string;
  time: string;
}

export function recentMeasurements(measurements: Measurement[], limit = 5): RecentMeasurementRow[] {
  return measurements.slice(0, limit).map((m) => ({
    definition: m.definitionName,
    experiment: m.experimentName,
    value: measurementValue(m),
    recordedBy: initials(m.recordedByName ?? ""),
    time: relativeTime(m.recordedAt),
  }));
}

export interface ActiveExperimentItem {
  name: string;
  project: string;
  measurementCount: number;
}

export function activeExperiments(experiments: Experiment[], limit = 5): ActiveExperimentItem[] {
  return experiments
    .filter((e) => e.status === "ACTIVE")
    .slice(0, limit)
    .map((e) => ({ name: e.title, project: e.projectName, measurementCount: e.measurementCount }));
}
