import { ProjectRole, type Prisma, type PrismaClient } from "@prisma/client";
import type {
  CreateExperimentInput,
  Experiment,
  ExperimentListItem,
  UpdateExperimentInput,
} from "../../domain/experiment";
import type { ExperimentsRepository } from "../../domain/experiments.repository";

export class PrismaExperimentsRepository implements ExperimentsRepository {
  constructor(private prisma: PrismaClient) {}

  async projectExists(projectId: string) {
    return (await this.prisma.project.count({ where: { id: projectId } })) > 0;
  }

  async sampleExists(sampleId: string) {
    return (await this.prisma.sample.count({ where: { id: sampleId } })) > 0;
  }

  async attachSample(experimentId: string, sampleId: string): Promise<void> {
    await this.prisma.experimentSample.createMany({
      data: [{ experimentId, sampleId }],
      skipDuplicates: true,
    });
  }

  async detachSample(experimentId: string, sampleId: string): Promise<void> {
    await this.prisma.experimentSample.deleteMany({ where: { experimentId, sampleId } });
  }

  async create(input: CreateExperimentInput): Promise<Experiment> {
    const e = await this.prisma.experiment.create({
      data: {
        title: input.title,
        hypothesis: input.hypothesis ?? null,
        projectId: input.projectId,
        status: (input.status as Prisma.ExperimentCreateInput["status"]) ?? null,
        previousExperimentId: input.previousExperimentId ?? null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });
    return {
      id: e.id,
      title: e.title,
      hypothesis: e.hypothesis ?? null,
      status: e.status,
      projectId: e.projectId,
      previousExperimentId: e.previousExperimentId,
      startDate: e.startDate?.toISOString() ?? null,
      endDate: e.endDate?.toISOString() ?? null,
    };
  }

  async update(id: string, input: UpdateExperimentInput): Promise<Experiment> {
    const e = await this.prisma.experiment.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.hypothesis !== undefined ? { hypothesis: input.hypothesis } : {}),
        ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
        ...(input.status !== undefined
          ? { status: input.status as Prisma.ExperimentUpdateInput["status"] }
          : {}),
        ...(input.previousExperimentId !== undefined
          ? { previousExperimentId: input.previousExperimentId ?? null }
          : {}),
        ...(input.startDate !== undefined
          ? { startDate: input.startDate ? new Date(input.startDate) : null }
          : {}),
        ...(input.endDate !== undefined
          ? { endDate: input.endDate ? new Date(input.endDate) : null }
          : {}),
      },
    });
    return {
      id: e.id,
      title: e.title,
      hypothesis: e.hypothesis ?? null,
      status: e.status,
      projectId: e.projectId,
      previousExperimentId: e.previousExperimentId,
      startDate: e.startDate?.toISOString() ?? null,
      endDate: e.endDate?.toISOString() ?? null,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.experiment.delete({ where: { id } });
  }

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
