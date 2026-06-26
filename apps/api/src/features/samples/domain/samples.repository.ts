import type { Sample } from "./sample";

export interface SamplesRepository {
  list(): Promise<Sample[]>;
  findById(id: string): Promise<Sample | null>;
}
