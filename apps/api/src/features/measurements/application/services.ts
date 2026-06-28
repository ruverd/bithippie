import type { MeasurementsRepository } from "../domain/measurements.repository";
import { CreateMeasurementService } from "./create-measurement.service";
import { ListMeasurementsService } from "./list-measurements.service";
import { UpdateMeasurementService } from "./update-measurement.service";

export interface MeasurementsServices {
  createMeasurement: CreateMeasurementService;
  updateMeasurement: UpdateMeasurementService;
  listMeasurements: ListMeasurementsService;
}

export function buildMeasurementsServices(repo: MeasurementsRepository): MeasurementsServices {
  return {
    createMeasurement: new CreateMeasurementService(repo),
    updateMeasurement: new UpdateMeasurementService(repo),
    listMeasurements: new ListMeasurementsService(repo),
  };
}
