import { NotFoundError } from "../../../shared/domain/errors";
import type { SamplesRepository } from "../domain/samples.repository";

export class DeleteSampleService {
  constructor(private readonly repo: SamplesRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.repo.findById(id))) {
      throw new NotFoundError(`Sample ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
