import { NotFoundError } from "../../../shared/domain/errors";
import type { ExperimentsRepository } from "../domain/experiments.repository";

export async function getExperimentSamples(repo: ExperimentsRepository, experimentId: string) {
  const experiment = await repo.findById(experimentId);
  if (!experiment) throw new NotFoundError(`Experiment ${experimentId} not found`);
  return repo.listSamples(experimentId);
}
