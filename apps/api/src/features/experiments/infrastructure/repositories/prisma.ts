import { ProjectRole, type PrismaClient } from "@prisma/client";
import type { ExperimentListItem } from "../../domain/experiment";
import type { ExperimentsRepository } from "../../domain/experiments.repository";

export class PrismaExperimentsRepository implements ExperimentsRepository {
  constructor(private prisma: PrismaClient) {}

  async list(): Promise<ExperimentListItem[]> {
    const rows = await this.prisma.experiment.findMany({
      include: {
        project: {
          include: {
            researchers: {
              where: { projectRole: ProjectRole.LEAD },
              include: { researcher: true },
            },
          },
        },
        _count: { select: { measurements: true } },
      },
      orderBy: { startDate: { sort: "desc", nulls: "last" } },
    });
    return rows.map((e) => ({
      id: e.id,
      title: e.title,
      hypothesis: e.hypothesis,
      status: e.status,
      projectId: e.projectId,
      projectName: e.project.title,
      leadName: e.project.researchers[0]?.researcher.name ?? null,
      measurementCount: e._count.measurements,
      startDate: e.startDate?.toISOString() ?? null,
    }));
  }

  async findById(id: string) {
    const e = await this.prisma.experiment.findUnique({ where: { id } });
    return e
      ? {
          id: e.id,
          title: e.title,
          hypothesis: e.hypothesis ?? null,
          status: e.status,
          projectId: e.projectId,
          previousExperimentId: e.previousExperimentId,
          startDate: e.startDate?.toISOString() ?? null,
          endDate: e.endDate?.toISOString() ?? null,
        }
      : null;
  }

  async listMeasurements(experimentId: string) {
    const rows = await this.prisma.measurement.findMany({
      where: { experimentId },
      include: { definition: true },
      orderBy: { recordedAt: "asc" },
    });
    return rows.map((m) => ({
      id: m.id,
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
    }));
  }

  async listSamples(experimentId: string) {
    const rows = await this.prisma.experimentSample.findMany({
      where: { experimentId },
      include: { sample: true },
    });
    return rows.map((r) => ({
      id: r.sample.id,
      code: r.sample.code,
      specimenType: r.sample.specimenType,
      storageLocation: r.sample.storageLocation,
    }));
  }
}
