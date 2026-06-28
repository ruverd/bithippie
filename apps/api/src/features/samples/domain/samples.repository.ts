import type { CreateSampleInput, Sample, UpdateSampleInput } from "./sample";

export interface SamplesRepository {
  list(): Promise<Sample[]>;
  findById(id: string): Promise<Sample | null>;
  create(input: CreateSampleInput): Promise<Sample>;
  update(id: string, input: UpdateSampleInput): Promise<Sample>;
  delete(id: string): Promise<void>;
}
