import type { Sample } from "../../domain/sample";
import type { SamplesRepository } from "../../domain/samples.repository";

export class InMemorySamplesRepository implements SamplesRepository {
  constructor(private samples: Sample[] = []) {}
  async list() { return this.samples; }
  async findById(id: string) { return this.samples.find((s) => s.id === id) ?? null; }
}
