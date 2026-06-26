import type { PrismaClient } from "@prisma/client";
import type { MeasurementValueType } from "@lab/shared";
import type { CreateMeasurementInput, CreatedMeasurement } from "../../domain/measurement";
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
}
