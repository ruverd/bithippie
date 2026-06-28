import { NotFoundError } from "../../../shared/domain/errors";
import type { MeasurementsRepository } from "../domain/measurements.repository";

export class DeleteMeasurementService {
  constructor(private readonly repo: MeasurementsRepository) {}

  async execute(id: string): Promise<void> {
    if (!(await this.repo.findById(id))) {
      throw new NotFoundError(`Measurement ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
