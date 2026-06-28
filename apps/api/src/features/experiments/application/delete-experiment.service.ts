import { NotFoundError } from "../../../shared/domain/errors";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class DeleteExperimentService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.repo.findById(id))) {
      throw new NotFoundError(`Experiment ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
