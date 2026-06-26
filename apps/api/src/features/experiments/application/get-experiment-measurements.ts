import type { ExperimentsRepository } from "../domain/experiments.repository";

export const getExperimentMeasurements = (repo: ExperimentsRepository, experimentId: string) =>
  repo.listMeasurements(experimentId);
