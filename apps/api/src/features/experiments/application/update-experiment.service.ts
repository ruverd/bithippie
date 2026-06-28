import { NotFoundError, ValidationError } from "../../../shared/domain/errors";
import type { Experiment, UpdateExperimentInput } from "../domain/experiment";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export class UpdateExperimentService {
  constructor(private readonly repo: ExperimentsRepository) {}

  async execute(id: string, input: UpdateExperimentInput): Promise<Experiment> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Experiment ${id} not found`);
    }
    if (input.projectId !== undefined && !(await this.repo.projectExists(input.projectId))) {
      throw new ValidationError(`Project ${input.projectId} not found`);
    }
    if (input.previousExperimentId) {
      if (input.previousExperimentId === id) {
        throw new ValidationError("An experiment cannot be a follow-up of itself");
      }
      const previous = await this.repo.findById(input.previousExperimentId);
      if (!previous) {
        throw new ValidationError(`Experiment ${input.previousExperimentId} not found`);
      }
      const projectId = input.projectId ?? existing.projectId;
      if (previous.projectId !== projectId) {
        throw new ValidationError("A follow-up experiment must belong to the same project");
      }
    }
    return this.repo.update(id, input);
  }
}
