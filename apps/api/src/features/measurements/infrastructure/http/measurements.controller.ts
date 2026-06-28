import type { CreateMeasurementInput, UpdateMeasurementInput } from "../../domain/measurement";
import type { MeasurementsServices } from "../../application/services";

type ResponseSet = { status?: number | string };

export class MeasurementsController {
  constructor(private readonly services: MeasurementsServices) {}

  listMeasurements() {
    return this.services.listMeasurements.execute();
  }

  async createMeasurement(
    experimentId: string,
    body: Omit<CreateMeasurementInput, "experimentId">,
    set: ResponseSet,
  ) {
    const result = await this.services.createMeasurement.execute({ ...body, experimentId });
    set.status = 201;
    return result;
  }

  updateMeasurement(id: string, body: UpdateMeasurementInput) {
    return this.services.updateMeasurement.execute(id, body);
  }
}
