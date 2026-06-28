import type { PrismaClient } from "@prisma/client";
import type { MeasurementValueType } from "@lab/shared";
import type {
  CreateMeasurementInput,
  CreatedMeasurement,
  MeasurementListItem,
  UpdateMeasurementInput,
} from "../../domain/measurement";
import type { MeasurementsRepository } from "../../domain/measurements.repository";

export class PrismaMeasurementsRepository implements MeasurementsRepository {
  constructor(private prisma: PrismaClient) {}

  async experimentExists(id: string) {
    return (await this.prisma.experiment.count({ where: { id } })) > 0;
  }

  async findDefinition(id: string) {
    const d = await this.prisma.measurementDefinition.findUnique({ where: { id } });
    return d
      ? { id: d.id, valueType: d.valueType as MeasurementValueType, allowedCategories: d.allowedCategories }
      : null;
  }

  async experimentSampleIds(experimentId: string) {
    return (
      await this.prisma.experimentSample.findMany({ where: { experimentId }, select: { sampleId: true } })
    ).map((r) => r.sampleId);
  }

  async researcherExists(id: string) {
    return (await this.prisma.researcher.count({ where: { id } })) > 0;
  }

  async create(input: CreateMeasurementInput): Promise<CreatedMeasurement> {
    const created = await this.prisma.measurement.create({
      data: {
        experimentId: input.experimentId,
        measurementDefinitionId: input.measurementDefinitionId,
        numericValue: input.numericValue ?? null,
        unit: input.unit ?? null,
        categoricalValue: input.categoricalValue ?? null,
        textValue: input.textValue ?? null,
        notes: input.notes ?? null,
        recordedAt: input.recordedAt ? new Date(input.recordedAt) : undefined,
        recordedById: input.recordedById ?? null,
        samples:
          input.sampleIds && input.sampleIds.length > 0
            ? { create: input.sampleIds.map((sampleId) => ({ sampleId })) }
            : undefined,
      },
      include: { samples: true },
    });
    return {
      id: created.id,
      experimentId: created.experimentId,
      measurementDefinitionId: created.measurementDefinitionId,
      numericValue: created.numericValue == null ? null : Number(created.numericValue),
      unit: created.unit,
      categoricalValue: created.categoricalValue,
      textValue: created.textValue,
      notes: created.notes,
      recordedAt: created.recordedAt.toISOString(),
      recordedById: created.recordedById,
      sampleIds: created.samples.map((s) => s.sampleId),
    };
  }

  async findById(id: string): Promise<CreatedMeasurement | null> {
    const m = await this.prisma.measurement.findUnique({ where: { id }, include: { samples: true } });
    return m
      ? {
          id: m.id,
          experimentId: m.experimentId,
          measurementDefinitionId: m.measurementDefinitionId,
          numericValue: m.numericValue == null ? null : Number(m.numericValue),
          unit: m.unit,
          categoricalValue: m.categoricalValue,
          textValue: m.textValue,
          notes: m.notes,
          recordedAt: m.recordedAt.toISOString(),
          recordedById: m.recordedById,
          sampleIds: m.samples.map((s) => s.sampleId),
        }
      : null;
  }

  async update(id: string, input: UpdateMeasurementInput): Promise<CreatedMeasurement> {
    const updated = await this.prisma.measurement.update({
      where: { id },
      data: {
        numericValue: input.numericValue ?? null,
        categoricalValue: input.categoricalValue ?? null,
        textValue: input.textValue ?? null,
        ...(input.unit !== undefined ? { unit: input.unit ?? null } : {}),
        ...(input.notes !== undefined ? { notes: input.notes ?? null } : {}),
        ...(input.recordedAt !== undefined
          ? { recordedAt: input.recordedAt ? new Date(input.recordedAt) : undefined }
          : {}),
        ...(input.recordedById !== undefined ? { recordedById: input.recordedById ?? null } : {}),
        ...(input.sampleIds !== undefined
          ? {
              samples: {
                deleteMany: {},
                create: input.sampleIds.map((sampleId) => ({ sampleId })),
              },
            }
          : {}),
      },
      include: { samples: true },
    });
    return {
      id: updated.id,
      experimentId: updated.experimentId,
      measurementDefinitionId: updated.measurementDefinitionId,
      numericValue: updated.numericValue == null ? null : Number(updated.numericValue),
      unit: updated.unit,
      categoricalValue: updated.categoricalValue,
      textValue: updated.textValue,
      notes: updated.notes,
      recordedAt: updated.recordedAt.toISOString(),
      recordedById: updated.recordedById,
      sampleIds: updated.samples.map((s) => s.sampleId),
    };
  }

  async list(): Promise<MeasurementListItem[]> {
    const rows = await this.prisma.measurement.findMany({
      include: { definition: true, experiment: true, recordedBy: true },
      orderBy: { recordedAt: "desc" },
    });
    return rows.map((m) => ({
      id: m.id,
      experimentId: m.experimentId,
      experimentName: m.experiment.title,
      measurementDefinitionId: m.measurementDefinitionId,
      definitionName: m.definition.name,
      valueType: m.definition.valueType,
      numericValue: m.numericValue == null ? null : Number(m.numericValue),
      unit: m.unit,
      categoricalValue: m.categoricalValue,
      textValue: m.textValue,
      notes: m.notes,
      recordedAt: m.recordedAt.toISOString(),
      recordedById: m.recordedById,
      recordedByName: m.recordedBy?.name ?? null,
    }));
  }
}
