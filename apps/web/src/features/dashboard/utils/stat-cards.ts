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
    activeProjects: projects.filter((project) => project.status === "ACTIVE").length,
    runningExperiments: experiments.filter((experiment) => experiment.status === "ACTIVE").length,
    samplesLogged: samples.length,
    measurements: measurements.length,
  };
}
