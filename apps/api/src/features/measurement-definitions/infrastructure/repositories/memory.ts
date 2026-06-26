import type { MeasurementDefinition } from "../../domain/measurement-definition";
import type { MeasurementDefinitionsRepository } from "../../domain/measurement-definitions.repository";

export class InMemoryMeasurementDefinitionsRepository implements MeasurementDefinitionsRepository {
  constructor(private definitions: MeasurementDefinition[] = []) {}
  async list() { return this.definitions; }
}
