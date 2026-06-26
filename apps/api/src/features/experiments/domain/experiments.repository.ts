import type {
  Experiment,
  ExperimentListItem,
  ExperimentMeasurement,
  ExperimentSample,
} from "./experiment";

export interface ExperimentsRepository {
  findById(id: string): Promise<Experiment | null>;
  list(): Promise<ExperimentListItem[]>;
  listMeasurements(experimentId: string): Promise<ExperimentMeasurement[]>;
  listSamples(experimentId: string): Promise<ExperimentSample[]>;
}
