import type { ExperimentsRepository } from "../domain/experiments.repository";

export const getExperimentSamples = (repo: ExperimentsRepository, experimentId: string) =>
  repo.listSamples(experimentId);
