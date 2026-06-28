import type {
  CreateExperimentInput,
  Experiment,
  ExperimentListItem,
  ExperimentMeasurement,
  ExperimentSample,
  UpdateExperimentInput,
} from "./experiment";

export interface ExperimentsRepository {
  findById(id: string): Promise<Experiment | null>;
  list(): Promise<ExperimentListItem[]>;
  create(input: CreateExperimentInput): Promise<Experiment>;
  update(id: string, input: UpdateExperimentInput): Promise<Experiment>;
  delete(id: string): Promise<void>;
  projectExists(projectId: string): Promise<boolean>;
  listMeasurements(experimentId: string): Promise<ExperimentMeasurement[]>;
  listSamples(experimentId: string): Promise<ExperimentSample[]>;
}
