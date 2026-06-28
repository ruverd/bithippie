import { NotFoundError, ValidationError } from "../../../shared/domain/errors";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class AttachExperimentSampleService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(experimentId: string, sampleId: string): Promise<void> {
    if (!(await this.repo.findById(experimentId))) {
      throw new NotFoundError(`Experiment ${experimentId} not found`);
    }
    if (!(await this.repo.sampleExists(sampleId))) {
      throw new ValidationError(`Sample ${sampleId} not found`);
    }
    await this.repo.attachSample(experimentId, sampleId);
  }
}
