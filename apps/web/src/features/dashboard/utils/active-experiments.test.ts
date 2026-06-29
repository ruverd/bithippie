import { describe, expect, it } from "vitest";
import { activeExperiments } from "./active-experiments";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";

type Experiment = GetExperiments200[number];

const experiment = (over: Record<string, unknown> = {}): Experiment =>
  ({
    id: "e",
    title: "Exp",
    status: "ACTIVE",
    projectName: "Proj",
    measurementCount: 0,
    ...over,
  }) as unknown as Experiment;

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
