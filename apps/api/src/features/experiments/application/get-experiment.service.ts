import { NotFoundError } from "../../../shared/domain/errors";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class GetExperimentService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(id: string) {
    const experiment = await this.repo.findById(id);
    if (!experiment) throw new NotFoundError(`Experiment ${id} not found`);
    return experiment;
  }
}
