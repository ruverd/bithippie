import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";

type Experiment = GetExperiments200[number];

export interface ActiveExperimentItem {
  id: string;
  name: string;
  project: string;
  measurementCount: number;
}

export function activeExperiments(experiments: Experiment[], limit = 5): ActiveExperimentItem[] {
  return experiments
    .filter((experiment) => experiment.status === "ACTIVE")
    .slice(0, limit)
    .map((experiment) => ({
      id: experiment.id,
      name: experiment.title,
      project: experiment.projectName,
      measurementCount: experiment.measurementCount,
    }));
}
