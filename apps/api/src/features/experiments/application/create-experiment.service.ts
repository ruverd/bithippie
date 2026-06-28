import { ValidationError } from "../../../shared/domain/errors";
import type { CreateExperimentInput, Experiment } from "../domain/experiment";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class CreateExperimentService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(input: CreateExperimentInput): Promise<Experiment> {
    if (!(await this.repo.projectExists(input.projectId))) {
      throw new ValidationError(`Project ${input.projectId} not found`);
    }
    if (input.previousExperimentId) {
      const previous = await this.repo.findById(input.previousExperimentId);
      if (!previous) {
        throw new ValidationError(`Experiment ${input.previousExperimentId} not found`);
      }
      if (previous.projectId !== input.projectId) {
        throw new ValidationError("A follow-up experiment must belong to the same project");
      }
    }
    return this.repo.create(input);
  }
}
