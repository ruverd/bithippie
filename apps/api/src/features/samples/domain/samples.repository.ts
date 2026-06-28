import type { CreateSampleInput, Sample } from "./sample";

export interface SamplesRepository {
  list(): Promise<Sample[]>;
  findById(id: string): Promise<Sample | null>;
  create(input: CreateSampleInput): Promise<Sample>;
}
