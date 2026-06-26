import type {
  CreateMeasurementInput,
  CreatedMeasurement,
  DefinitionRuleRow,
  MeasurementListItem,
} from "../../domain/measurement";
import type { MeasurementsRepository } from "../../domain/measurements.repository";

interface Seed {
  experiments: string[];
  samples: Record<string, string[]>;
  researchers: string[];
  definitions: Record<string, DefinitionRuleRow>;
  list?: MeasurementListItem[];
}

export class InMemoryMeasurementsRepository implements MeasurementsRepository {
  private seq = 0;
  constructor(private data: Seed) {}

  async experimentExists(id: string) {
    return this.data.experiments.includes(id);
  }

  async findDefinition(id: string) {
    return this.data.definitions[id] ?? null;
  }

  async experimentSampleIds(experimentId: string) {
    return this.data.samples[experimentId] ?? [];
  }

  async researcherExists(id: string) {
    return this.data.researchers.includes(id);
  }

  async create(input: CreateMeasurementInput): Promise<CreatedMeasurement> {
    this.seq += 1;
    return {
      id: `mem-${this.seq}`,
      experimentId: input.experimentId,
      measurementDefinitionId: input.measurementDefinitionId,
      numericValue: input.numericValue == null ? null : input.numericValue,
      unit: input.unit ?? null,
      categoricalValue: input.categoricalValue ?? null,
      textValue: input.textValue ?? null,
      notes: input.notes ?? null,
      recordedAt: input.recordedAt ?? new Date(0).toISOString(),
      recordedById: input.recordedById ?? null,
      sampleIds: input.sampleIds ?? [],
    };
  }

  async list(): Promise<MeasurementListItem[]> {
    return this.data.list ?? [];
  }
}
