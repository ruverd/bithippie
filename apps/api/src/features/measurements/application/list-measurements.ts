import type { MeasurementsRepository } from "../domain/measurements.repository";

export const listMeasurements = (repo: MeasurementsRepository) => repo.list();
