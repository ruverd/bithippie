import type {
  CreateMeasurementInput,
  CreatedMeasurement,
  DefinitionRuleRow,
  MeasurementListItem,
  UpdateMeasurementInput,
} from "../../domain/measurement";
import type { MeasurementsRepository } from "../../domain/measurements.repository";
import { NotFoundError } from "../../../../shared/domain/errors";

interface Seed {
  experiments: string[];
  samples: Record<string, string[]>;
  researchers: string[];
  definitions: Record<string, DefinitionRuleRow>;
  list?: MeasurementListItem[];
}

export class InMemoryMeasurementsRepository implements MeasurementsRepository {
  private seq = 0;
  private created: CreatedMeasurement[] = [];
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
    const created: CreatedMeasurement = {
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
    this.created.push(created);
    return created;
  }

  async findById(id: string): Promise<CreatedMeasurement | null> {
    const fromCreated = this.created.find((x) => x.id === id);
    if (fromCreated) return fromCreated;
    const m = (this.data.list ?? []).find((x) => x.id === id);
    return m
      ? {
          id: m.id,
          experimentId: m.experimentId,
          measurementDefinitionId: m.measurementDefinitionId,
          numericValue: m.numericValue,
          unit: m.unit,
          categoricalValue: m.categoricalValue,
          textValue: m.textValue,
          notes: m.notes,
          recordedAt: m.recordedAt,
          recordedById: m.recordedById,
          sampleIds: [],
        }
      : null;
  }

  async update(id: string, input: UpdateMeasurementInput): Promise<CreatedMeasurement> {
    const m = (this.data.list ?? []).find((x) => x.id === id);
    if (!m) throw new NotFoundError(`Measurement ${id} not found`);
    m.numericValue = input.numericValue ?? null;
    m.categoricalValue = input.categoricalValue ?? null;
    m.textValue = input.textValue ?? null;
    if (input.unit !== undefined) m.unit = input.unit ?? null;
    if (input.notes !== undefined) m.notes = input.notes ?? null;
    if (input.recordedById !== undefined) m.recordedById = input.recordedById ?? null;
    return {
      id: m.id,
      experimentId: m.experimentId,
      measurementDefinitionId: m.measurementDefinitionId,
      numericValue: m.numericValue,
      unit: m.unit,
      categoricalValue: m.categoricalValue,
      textValue: m.textValue,
      notes: m.notes,
      recordedAt: m.recordedAt,
      recordedById: m.recordedById,
      sampleIds: input.sampleIds ?? [],
    };
  }

  async delete(id: string): Promise<void> {
    this.created = this.created.filter((x) => x.id !== id);
    if (this.data.list) {
      this.data.list = this.data.list.filter((x) => x.id !== id);
    }
  }

  async list(): Promise<MeasurementListItem[]> {
    return this.data.list ?? [];
  }
}
