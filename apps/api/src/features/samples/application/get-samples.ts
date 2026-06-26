import type { SamplesRepository } from "../domain/samples.repository";

export const getSamples = (repo: SamplesRepository) => repo.list();
