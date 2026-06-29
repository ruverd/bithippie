import { describe, expect, it } from "vitest";
import { recentMeasurements } from "./recent-measurements";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Measurement = GetMeasurements200[number];

const measurement = (over: Record<string, unknown> = {}): Measurement =>
  ({
    id: "m",
    experimentName: "Exp",
    definitionName: "Lead",
    valueType: "NUMERIC",
    numericValue: 1,
    unit: "mg/L",
    categoricalValue: null,
    textValue: null,
    recordedAt: "2026-06-10T00:00:00.000Z",
    recordedByName: "Alice Nguyen",
    ...over,
  }) as unknown as Measurement;

describe("recentMeasurements", () => {
  it("should take the first N and format via the shared utils", () => {
    const rows = recentMeasurements([measurement()], 5);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      id: "m",
      definition: "Lead",
      experiment: "Exp",
      value: "1 mg/L",
      recordedBy: "AN",
      time: expect.any(String),
    });
  });
});
