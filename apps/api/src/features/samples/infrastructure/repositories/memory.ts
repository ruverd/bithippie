import { ValidationError } from "../../../../shared/domain/errors";
import type { CreateSampleInput, Sample } from "../../domain/sample";
import type { SamplesRepository } from "../../domain/samples.repository";

export class InMemorySamplesRepository implements SamplesRepository {
  private seq = 0;
  constructor(private samples: Sample[] = []) {}
  async list() { return this.samples; }
  async findById(id: string) { return this.samples.find((s) => s.id === id) ?? null; }
  async create(input: CreateSampleInput): Promise<Sample> {
    if (this.samples.some((s) => s.code === input.code)) {
      throw new ValidationError(`Sample code "${input.code}" already exists`);
    }
    this.seq += 1;
    const created: Sample = {
      id: `mem-samp-${this.seq}`,
      code: input.code,
      specimenType: input.specimenType,
      collectedAt: input.collectedAt ?? null,
      storageLocation: input.storageLocation ?? null,
      experimentCount: 0,
    };
    this.samples.push(created);
    return created;
  }
}
