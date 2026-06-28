import type { MeasurementDefinitionsRepository } from "../domain/measurement-definitions.repository";
import { GetMeasurementDefinitionsService } from "./get-measurement-definitions.service";

export interface MeasurementDefinitionsServices {
  getMeasurementDefinitions: GetMeasurementDefinitionsService;
}

export function buildMeasurementDefinitionsServices(
  repo: MeasurementDefinitionsRepository,
): MeasurementDefinitionsServices {
  return {
    getMeasurementDefinitions: new GetMeasurementDefinitionsService(repo),
  };
}
