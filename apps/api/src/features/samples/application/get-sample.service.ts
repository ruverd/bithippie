import { NotFoundError } from "../../../shared/domain/errors";
import type { Sample } from "../domain/sample";
import type { SamplesRepository } from "../domain/samples.repository";

export class GetSampleService {
  constructor(private readonly repo: SamplesRepository) {}

  async execute(id: string): Promise<Sample> {
    const sample = await this.repo.findById(id);
    if (!sample) throw new NotFoundError(`Sample ${id} not found`);
    return sample;
  }
}
