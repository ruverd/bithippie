import { NotFoundError, ValidationError } from "../../../shared/domain/errors";
import type { Experiment, UpdateExperimentInput } from "../domain/experiment";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class UpdateExperimentService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(id: string, input: UpdateExperimentInput): Promise<Experiment> {
    if (!(await this.repo.findById(id))) {
      throw new NotFoundError(`Experiment ${id} not found`);
    }
    if (input.projectId !== undefined && !(await this.repo.projectExists(input.projectId))) {
      throw new ValidationError(`Project ${input.projectId} not found`);
    }
    return this.repo.update(id, input);
  }
}
