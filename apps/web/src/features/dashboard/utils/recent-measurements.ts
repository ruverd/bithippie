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
  return measurements.slice(0, limit).map((measurement) => ({
    id: measurement.id,
    definition: measurement.definitionName,
    experiment: measurement.experimentName,
    value: measurementValue(measurement),
    recordedBy: initials(measurement.recordedByName ?? ""),
    time: relativeTime(measurement.recordedAt),
  }));
}
