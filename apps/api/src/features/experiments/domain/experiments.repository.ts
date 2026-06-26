import type { Experiment, ExperimentMeasurement, ExperimentSample } from "./experiment";

export interface ExperimentsRepository {
  findById(id: string): Promise<Experiment | null>;
  listMeasurements(experimentId: string): Promise<ExperimentMeasurement[]>;
  listSamples(experimentId: string): Promise<ExperimentSample[]>;
}
