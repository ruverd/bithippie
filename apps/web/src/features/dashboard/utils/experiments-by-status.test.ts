import { describe, expect, it } from "vitest";
import { experimentsByStatus } from "./experiments-by-status";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";

type Experiment = GetExperiments200[number];

const experiment = (status: string | null): Experiment =>
  ({ id: "e", title: "Exp", status }) as unknown as Experiment;

describe("experimentsByStatus", () => {
  it("should group known statuses, map labels/colors, sum total, exclude null/unknown", () => {
    const result = experimentsByStatus([
      experiment("ACTIVE"),
      experiment("ACTIVE"),
      experiment("COMPLETED"),
      experiment(null),
      experiment("WEIRD"),
    ]);
    expect(result.total).toBe(3);
    expect(result.items).toEqual([
      { status: "Active", count: 2, color: "var(--chart-1)" },
      { status: "Completed", count: 1, color: "var(--chart-2)" },
    ]);
  });
});
