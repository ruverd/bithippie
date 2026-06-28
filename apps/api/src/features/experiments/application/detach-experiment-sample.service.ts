import { NotFoundError } from "../../../shared/domain/errors";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class DetachExperimentSampleService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(experimentId: string, sampleId: string): Promise<void> {
    if (!(await this.repo.findById(experimentId))) {
      throw new NotFoundError(`Experiment ${experimentId} not found`);
    }
    await this.repo.detachSample(experimentId, sampleId);
  }
}
