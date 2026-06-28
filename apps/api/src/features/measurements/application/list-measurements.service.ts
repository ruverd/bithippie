import type { MeasurementListItem } from "../domain/measurement";
import type { MeasurementsRepository } from "../domain/measurements.repository";

export class ListMeasurementsService {
  constructor(private readonly repo: MeasurementsRepository) {}

  execute(): Promise<MeasurementListItem[]> {
    return this.repo.list();
  }
}
