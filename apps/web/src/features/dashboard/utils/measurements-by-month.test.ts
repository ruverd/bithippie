import { describe, expect, it } from "vitest";
import { measurementsByMonth } from "./measurements-by-month";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Measurement = GetMeasurements200[number];

const NOW = new Date("2026-06-15T12:00:00.000Z");

const measurement = (over: Record<string, unknown> = {}): Measurement =>
  ({ id: "m", recordedAt: "2026-06-10T00:00:00.000Z", ...over }) as unknown as Measurement;

describe("measurementsByMonth", () => {
  it("should return monthsBack buckets ending at now, zero-filled", () => {
    const result = measurementsByMonth([], NOW, 8);
    expect(result).toHaveLength(8);
    expect(result[7]).toEqual({ m: "Jun", v: 0 });
    expect(result[0]).toEqual({ m: "Nov", v: 0 });
  });

  it("should count measurements into their recordedAt month and ignore out-of-window", () => {
    const result = measurementsByMonth(
      [
        measurement({ recordedAt: "2026-06-01T00:00:00.000Z" }),
        measurement({ recordedAt: "2026-06-20T00:00:00.000Z" }),
        measurement({ recordedAt: "2026-05-10T00:00:00.000Z" }),
        measurement({ recordedAt: "2024-01-01T00:00:00.000Z" }),
        measurement({ recordedAt: "not-a-date" }),
      ],
      NOW,
      8,
    );
    expect(result.find((b) => b.m === "Jun")?.v).toBe(2);
    expect(result.find((b) => b.m === "May")?.v).toBe(1);
    expect(result.reduce((s, b) => s + b.v, 0)).toBe(3);
  });
});
