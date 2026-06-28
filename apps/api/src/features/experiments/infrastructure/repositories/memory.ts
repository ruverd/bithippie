import type {
  CreateExperimentInput,
  Experiment,
  ExperimentListItem,
  ExperimentMeasurement,
  ExperimentSample,
  UpdateExperimentInput,
} from "../../domain/experiment";
import type { ExperimentsRepository } from "../../domain/experiments.repository";
import { NotFoundError } from "../../../../shared/domain/errors";

export class InMemoryExperimentsRepository implements ExperimentsRepository {
  private seq = 0;
  constructor(
    private experiments: Experiment[] = [],
    private measurements: Record<string, ExperimentMeasurement[]> = {},
    private samples: Record<string, ExperimentSample[]> = {},
    private listItems: ExperimentListItem[] = [],
    private knownProjectIds: string[] = [],
    private sampleDirectory: Record<string, ExperimentSample> = {},
  ) {}
  async findById(id: string) { return this.experiments.find((e) => e.id === id) ?? null; }
  async list() { return this.listItems; }
  async projectExists(projectId: string) { return this.knownProjectIds.includes(projectId); }
  async sampleExists(sampleId: string) { return sampleId in this.sampleDirectory; }
  async attachSample(experimentId: string, sampleId: string): Promise<void> {
    const current = this.samples[experimentId] ?? [];
    if (current.some((s) => s.id === sampleId)) return;
    const sample = this.sampleDirectory[sampleId];
    if (!sample) return;
    this.samples[experimentId] = [...current, sample];
  }
  async detachSample(experimentId: string, sampleId: string): Promise<void> {
    this.samples[experimentId] = (this.samples[experimentId] ?? []).filter((s) => s.id !== sampleId);
  }
  async create(input: CreateExperimentInput): Promise<Experiment> {
    this.seq += 1;
    const created: Experiment = {
      id: `mem-exp-${this.seq}`,
      title: input.title,
      hypothesis: input.hypothesis ?? null,
      status: input.status ?? null,
      projectId: input.projectId,
      previousExperimentId: input.previousExperimentId ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
    };
    this.experiments.push(created);
    return created;
  }
  async update(id: string, input: UpdateExperimentInput): Promise<Experiment> {
    const e = this.experiments.find((x) => x.id === id);
    if (!e) throw new NotFoundError(`Experiment ${id} not found`);
    if (input.title !== undefined) e.title = input.title;
    if (input.hypothesis !== undefined) e.hypothesis = input.hypothesis ?? null;
    if (input.projectId !== undefined) e.projectId = input.projectId;
    if (input.status !== undefined) e.status = input.status ?? null;
    if (input.previousExperimentId !== undefined)
      e.previousExperimentId = input.previousExperimentId ?? null;
    if (input.startDate !== undefined) e.startDate = input.startDate ?? null;
    if (input.endDate !== undefined) e.endDate = input.endDate ?? null;
    return e;
  }
  async delete(id: string): Promise<void> {
    this.experiments = this.experiments.filter((x) => x.id !== id);
    this.listItems = this.listItems.filter((x) => x.id !== id);
  }
  async listMeasurements(experimentId: string) { return this.measurements[experimentId] ?? []; }
  async listSamples(experimentId: string) { return this.samples[experimentId] ?? []; }
}
