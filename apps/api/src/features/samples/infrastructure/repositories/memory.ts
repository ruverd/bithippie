import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";
import type { CreateSampleInput, Sample, UpdateSampleInput } from "../../domain/sample";
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
  async update(id: string, input: UpdateSampleInput): Promise<Sample> {
    const s = this.samples.find((x) => x.id === id);
    if (!s) throw new NotFoundError(`Sample ${id} not found`);
    if (
      input.code !== undefined &&
      this.samples.some((x) => x.id !== id && x.code === input.code)
    ) {
      throw new ValidationError(`Sample code "${input.code}" already exists`);
    }
    if (input.code !== undefined) s.code = input.code;
    if (input.specimenType !== undefined) s.specimenType = input.specimenType;
    if (input.collectedAt !== undefined) s.collectedAt = input.collectedAt ?? null;
    if (input.storageLocation !== undefined) s.storageLocation = input.storageLocation ?? null;
    return s;
  }
  async delete(id: string): Promise<void> {
    this.samples = this.samples.filter((x) => x.id !== id);
  }
}
