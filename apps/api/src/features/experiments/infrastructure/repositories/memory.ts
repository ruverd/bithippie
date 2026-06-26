import type {
  Experiment,
  ExperimentListItem,
  ExperimentMeasurement,
  ExperimentSample,
} from "../../domain/experiment";
import type { ExperimentsRepository } from "../../domain/experiments.repository";

export class InMemoryExperimentsRepository implements ExperimentsRepository {
  constructor(
    private experiments: Experiment[] = [],
    private measurements: Record<string, ExperimentMeasurement[]> = {},
    private samples: Record<string, ExperimentSample[]> = {},
    private listItems: ExperimentListItem[] = [],
  ) {}
  async findById(id: string) { return this.experiments.find((e) => e.id === id) ?? null; }
  async list() { return this.listItems; }
  async listMeasurements(experimentId: string) { return this.measurements[experimentId] ?? []; }
  async listSamples(experimentId: string) { return this.samples[experimentId] ?? []; }
}
