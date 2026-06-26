import { NotFoundError } from "../../../shared/domain/errors";
import type { SamplesRepository } from "../domain/samples.repository";

export async function getSample(repo: SamplesRepository, id: string) {
  const sample = await repo.findById(id);
  if (!sample) throw new NotFoundError(`Sample ${id} not found`);
  return sample;
}
