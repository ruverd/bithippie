import type { MeasurementDefinitionsServices } from "../../application/services";

export class MeasurementDefinitionsController {
  constructor(private readonly services: MeasurementDefinitionsServices) {}

  getMeasurementDefinitions() {
    return this.services.getMeasurementDefinitions.execute();
  }
}
