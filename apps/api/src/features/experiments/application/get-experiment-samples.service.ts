import { NotFoundError } from "../../../shared/domain/errors";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class GetExperimentSamplesService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(experimentId: string) {
    const experiment = await this.repo.findById(experimentId);
    if (!experiment) throw new NotFoundError(`Experiment ${experimentId} not found`);
    return this.repo.listSamples(experimentId);
  }
}
