import { describe, expect, it } from "vitest";
import {
  statCards,
  measurementsByMonth,
  experimentsByStatus,
  recentMeasurements,
  activeExperiments,
} from "./aggregate";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Project = GetProjects200[number];
type Experiment = GetExperiments200[number];
type Sample = GetSamples200[number];
type Measurement = GetMeasurements200[number];

const NOW = new Date("2026-06-15T12:00:00.000Z");

// Cast via `unknown` so the tests exercise aggregation logic without coupling to
// every generated field (the functions only read the fields set below).
const project = (status: string | null): Project =>
  ({ id: "p", title: "P", description: null, status }) as unknown as Project;
const sample = (): Sample =>
  ({
    id: "s",
    code: "C",
    specimenType: "blood",
    collectedAt: null,
    storageLocation: null,
    experimentCount: 0,
  }) as unknown as Sample;
const experiment = (over: Record<string, unknown> = {}): Experiment =>
  ({
    id: "e",
    title: "Exp",
    hypothesis: null,
    status: "ACTIVE",
    projectId: "p",
    projectName: "Proj",
    leadName: null,
    measurementCount: 0,
    startDate: null,
    ...over,
  }) as unknown as Experiment;
const measurement = (over: Record<string, unknown> = {}): Measurement =>
  ({
    id: "m",
    experimentId: "e",
    experimentName: "Exp",
    measurementDefinitionId: "d",
    definitionName: "Lead",
    valueType: "NUMERIC",
    numericValue: 1,
    unit: "mg/L",
    categoricalValue: null,
    textValue: null,
    notes: null,
    recordedAt: "2026-06-10T00:00:00.000Z",
    recordedById: "r",
    recordedByName: "Alice Nguyen",
    ...over,
  }) as unknown as Measurement;

describe("statCards", () => {
  it("should count active projects, active experiments, samples and measurements", () => {
    const result = statCards(
      [project("ACTIVE"), project("PLANNING"), project(null)],
      [experiment({ status: "ACTIVE" }), experiment({ status: "COMPLETED" })],
      [sample(), sample(), sample()],
      [measurement(), measurement()],
    );
    expect(result).toEqual({
      activeProjects: 1,
      runningExperiments: 1,
      samplesLogged: 3,
      measurements: 2,
    });
  });
});

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

describe("experimentsByStatus", () => {
  it("should group known statuses, map labels/colors, sum total, exclude null/unknown", () => {
    const result = experimentsByStatus([
      experiment({ status: "ACTIVE" }),
      experiment({ status: "ACTIVE" }),
      experiment({ status: "COMPLETED" }),
      experiment({ status: null }),
      experiment({ status: "WEIRD" }),
    ]);
    expect(result.total).toBe(3);
    expect(result.items).toEqual([
      { status: "Active", count: 2, color: "var(--chart-1)" },
      { status: "Completed", count: 1, color: "var(--chart-2)" },
    ]);
  });
});

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

describe("activeExperiments", () => {
  it("should keep only ACTIVE, cap at the limit, and expose measurementCount", () => {
    const result = activeExperiments(
      [
        experiment({ title: "A", projectName: "Water", measurementCount: 3, status: "ACTIVE" }),
        experiment({ title: "B", status: "COMPLETED" }),
      ],
      5,
    );
    expect(result).toEqual([{ id: "e", name: "A", project: "Water", measurementCount: 3 }]);
  });
});
