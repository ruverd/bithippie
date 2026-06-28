import { validateMeasurementValue } from "@lab/shared";
import { NotFoundError, ValidationError } from "../../../shared/domain/errors";
import type { CreatedMeasurement, UpdateMeasurementInput } from "../domain/measurement";
import type { MeasurementsRepository } from "../domain/measurements.repository";

export class UpdateMeasurementService {
  constructor(private readonly repo: MeasurementsRepository) {}

  async execute(id: string, input: UpdateMeasurementInput): Promise<CreatedMeasurement> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Measurement ${id} not found`);
    }
    const definition = await this.repo.findDefinition(existing.measurementDefinitionId);
    if (!definition) {
      throw new ValidationError(`Measurement definition ${existing.measurementDefinitionId} not found`);
    }
    const check = validateMeasurementValue(definition, input);
    if (!check.ok) throw new ValidationError(check.reason);

    if (input.sampleIds && input.sampleIds.length > 0) {
      const allowed = new Set(await this.repo.experimentSampleIds(existing.experimentId));
      const stray = input.sampleIds.filter((sid) => !allowed.has(sid));
      if (stray.length > 0) {
        throw new ValidationError(`Sample(s) not used by this experiment: ${stray.join(", ")}`);
      }
    }
    if (input.recordedById && !(await this.repo.researcherExists(input.recordedById))) {
      throw new ValidationError(`Researcher ${input.recordedById} not found`);
    }
    return this.repo.update(id, input);
  }
}
