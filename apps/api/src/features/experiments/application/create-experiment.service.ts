import { ValidationError } from "../../../shared/domain/errors";
import type { CreateExperimentInput, Experiment } from "../domain/experiment";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class CreateExperimentService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(input: CreateExperimentInput): Promise<Experiment> {
    if (!(await this.repo.projectExists(input.projectId))) {
      throw new ValidationError(`Project ${input.projectId} not found`);
    }
    return this.repo.create(input);
  }
}
