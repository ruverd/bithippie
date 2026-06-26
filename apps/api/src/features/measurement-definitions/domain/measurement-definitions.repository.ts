import type { MeasurementDefinition } from "./measurement-definition";

export interface MeasurementDefinitionsRepository {
  list(): Promise<MeasurementDefinition[]>;
}
