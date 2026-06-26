import { NotFoundError } from "../../../shared/domain/errors";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export async function getExperiment(repo: ExperimentsRepository, id: string) {
  const experiment = await repo.findById(id);
  if (!experiment) throw new NotFoundError(`Experiment ${id} not found`);
  return experiment;
}
