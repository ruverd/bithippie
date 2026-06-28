import type { MeasurementDefinitionsRepository } from "../domain/measurement-definitions.repository";

export class GetMeasurementDefinitionsService {
  constructor(private readonly repo: MeasurementDefinitionsRepository) {}

  execute() {
    return this.repo.list();
  }
}
