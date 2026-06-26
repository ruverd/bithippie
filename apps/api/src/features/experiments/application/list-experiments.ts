import type { ExperimentsRepository } from "../domain/experiments.repository";

export const listExperiments = (repo: ExperimentsRepository) => repo.list();
