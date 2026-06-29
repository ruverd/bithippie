import { describe, expect, it } from "vitest";
import { statCards } from "./stat-cards";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Project = GetProjects200[number];
type Experiment = GetExperiments200[number];
type Sample = GetSamples200[number];

const project = (status: string | null): Project =>
  ({ id: "p", title: "P", description: null, status }) as unknown as Project;
const sample = (): Sample =>
  ({ id: "s", code: "C", specimenType: "blood" }) as unknown as Sample;
const experiment = (status: string): Experiment =>
  ({ id: "e", title: "Exp", status }) as unknown as Experiment;

describe("statCards", () => {
  it("should count active projects, active experiments, samples and measurements", () => {
    const result = statCards(
      [project("ACTIVE"), project("PLANNING"), project(null)],
      [experiment("ACTIVE"), experiment("COMPLETED")],
      [sample(), sample(), sample()],
      [{}, {}] as unknown as GetMeasurements200,
    );
    expect(result).toEqual({
      activeProjects: 1,
      runningExperiments: 1,
      samplesLogged: 3,
      measurements: 2,
    });
  });
});
