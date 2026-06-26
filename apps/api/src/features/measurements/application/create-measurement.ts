import { validateMeasurementValue } from "@lab/shared";
import { NotFoundError, ValidationError } from "../../../shared/domain/errors";
import type { CreateMeasurementInput, CreatedMeasurement } from "../domain/measurement";
import type { MeasurementsRepository } from "../domain/measurements.repository";

export async function createMeasurement(
  repo: MeasurementsRepository,
  input: CreateMeasurementInput,
): Promise<CreatedMeasurement> {
  if (!(await repo.experimentExists(input.experimentId))) {
    throw new NotFoundError(`Experiment ${input.experimentId} not found`);
  }
  const definition = await repo.findDefinition(input.measurementDefinitionId);
  if (!definition) {
    throw new ValidationError(`Measurement definition ${input.measurementDefinitionId} not found`);
  }
  const check = validateMeasurementValue(definition, input);
  if (!check.ok) throw new ValidationError(check.reason);

  if (input.sampleIds && input.sampleIds.length > 0) {
    const allowed = new Set(await repo.experimentSampleIds(input.experimentId));
    const stray = input.sampleIds.filter((id) => !allowed.has(id));
    if (stray.length > 0) {
      throw new ValidationError(`Sample(s) not used by this experiment: ${stray.join(", ")}`);
    }
  }
  if (input.recordedById && !(await repo.researcherExists(input.recordedById))) {
    throw new ValidationError(`Researcher ${input.recordedById} not found`);
  }
  return repo.create(input);
}
