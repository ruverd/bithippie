import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Measurement = GetMeasurements200[number];

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
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    indexByKey.set(`${d.getUTCFullYear()}-${d.getUTCMonth()}`, buckets.length);
    buckets.push({ m: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), v: 0 });
  }
  for (const meas of measurements) {
    const d = new Date(meas.recordedAt);
    if (Number.isNaN(d.getTime())) continue;
    const at = indexByKey.get(`${d.getUTCFullYear()}-${d.getUTCMonth()}`);
    if (at !== undefined) buckets[at]!.v += 1;
  }
  return buckets;
}
