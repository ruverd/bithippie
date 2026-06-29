import { measurementValue } from "@/utils/measurement-value";
import { initials } from "@/utils/initials";
import { relativeTime } from "@/utils/relative-time";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Measurement = GetMeasurements200[number];

export interface RecentMeasurementRow {
  id: string;
  definition: string;
  experiment: string;
  value: string;
  recordedBy: string;
  time: string;
}

export function recentMeasurements(measurements: Measurement[], limit = 5): RecentMeasurementRow[] {
  return measurements.slice(0, limit).map((m) => ({
    id: m.id,
    definition: m.definitionName,
    experiment: m.experimentName,
    value: measurementValue(m),
    recordedBy: initials(m.recordedByName ?? ""),
    time: relativeTime(m.recordedAt),
  }));
}
