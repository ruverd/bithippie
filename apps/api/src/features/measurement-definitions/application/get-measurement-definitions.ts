import type { MeasurementDefinitionsRepository } from "../domain/measurement-definitions.repository";

export const getMeasurementDefinitions = (repo: MeasurementDefinitionsRepository) => repo.list();
