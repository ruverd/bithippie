import type { Sample } from "../domain/sample";
import type { SamplesRepository } from "../domain/samples.repository";

export class GetSamplesService {
  constructor(private readonly repo: SamplesRepository) {}

  execute(): Promise<Sample[]> {
    return this.repo.list();
  }
}
