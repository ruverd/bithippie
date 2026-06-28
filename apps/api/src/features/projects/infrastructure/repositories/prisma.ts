import { ProjectRole, type Prisma, type PrismaClient } from "@prisma/client";
import type {
  CreateProjectInput,
  ProjectDetail,
  UpdateProjectInput,
} from "../../domain/project";
import type { ProjectsRepository } from "../../domain/projects.repository";
import { toProject, toProjectListItem } from "../mappers";

export class PrismaProjectsRepository implements ProjectsRepository {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return (
      await this.prisma.project.findMany({
        orderBy: { title: "asc" },
        include: {
          _count: { select: { experiments: true } },
          researchers: { include: { researcher: { select: { name: true } } } },
        },
      })
    ).map(toProjectListItem);
  }

  async findById(id: string) {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row ? toProject(row) : null;
  }

  async findDetail(id: string): Promise<ProjectDetail | null> {
    const row = await this.prisma.project.findUnique({
      where: { id },
      include: {
        researchers: { where: { projectRole: ProjectRole.LEAD }, include: { researcher: true } },
        _count: { select: { experiments: true } },
      },
    });
    if (!row) return null;
    const sampleCount = await this.prisma.sample.count({
      where: { experiments: { some: { experiment: { projectId: id } } } },
    });
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      leadName: row.researchers[0]?.researcher.name ?? null,
      experimentCount: row._count.experiments,
      sampleCount,
    };
  }

  async missingResearchers(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const found = await this.prisma.researcher.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const foundIds = new Set(found.map((r) => r.id));
    return ids.filter((id) => !foundIds.has(id));
  }

  async create(input: CreateProjectInput): Promise<ProjectDetail> {
    const created = await this.prisma.project.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        status: (input.status as Prisma.ProjectCreateInput["status"]) ?? null,
        researchers: { create: membershipRows(input.leadResearcherId, input.collaboratorIds) },
      },
    });
    return (await this.findDetail(created.id))!;
  }

  async update(id: string, input: UpdateProjectInput): Promise<ProjectDetail> {
    const membershipsProvided =
      input.leadResearcherId !== undefined || input.collaboratorIds !== undefined;
    await this.prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.status !== undefined
            ? { status: input.status as Prisma.ProjectUpdateInput["status"] }
            : {}),
        },
      });
      if (membershipsProvided) {
        await tx.projectResearcher.deleteMany({ where: { projectId: id } });
        const rows = membershipRows(input.leadResearcherId, input.collaboratorIds);
        if (rows.length > 0) {
          await tx.projectResearcher.createMany({
            data: rows.map((r) => ({ ...r, projectId: id })),
          });
        }
      }
    });
    return (await this.findDetail(id))!;
  }

  async listResearchers(projectId: string) {
    const rows = await this.prisma.projectResearcher.findMany({
      where: { projectId },
      include: { researcher: true },
      orderBy: { researcher: { name: "asc" } },
    });
    return rows.map((r) => ({
      researcherId: r.researcherId,
      name: r.researcher.name,
      email: r.researcher.email,
      globalRole: r.researcher.globalRole,
      projectRole: r.projectRole,
    }));
  }

  async listExperiments(projectId: string) {
    return (
      await this.prisma.experiment.findMany({ where: { projectId }, orderBy: { title: "asc" } })
    ).map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      previousExperimentId: e.previousExperimentId,
    }));
  }

  async listSamples(projectId: string) {
    const rows = await this.prisma.sample.findMany({
      where: { experiments: { some: { experiment: { projectId } } } },
      orderBy: { code: "asc" },
      include: {
        experiments: {
          where: { experiment: { projectId } },
          select: { experimentId: true },
        },
      },
    });
    return rows.map((s) => ({
      id: s.id,
      code: s.code,
      specimenType: s.specimenType,
      collectedAt: s.collectedAt?.toISOString() ?? null,
      storageLocation: s.storageLocation,
      experimentIds: s.experiments.map((e) => e.experimentId),
    }));
  }

  async listMeasurements(projectId: string) {
    const rows = await this.prisma.measurement.findMany({
      where: { experiment: { projectId } },
      include: { definition: true, experiment: true, recordedBy: true },
      orderBy: { recordedAt: "desc" },
    });
    return rows.map((m) => ({
      id: m.id,
      definitionName: m.definition.name,
      valueType: m.definition.valueType,
      numericValue: m.numericValue == null ? null : Number(m.numericValue),
      unit: m.unit,
      categoricalValue: m.categoricalValue,
      textValue: m.textValue,
      experimentId: m.experimentId,
      experimentName: m.experiment.title,
      recordedAt: m.recordedAt.toISOString(),
      recordedById: m.recordedById,
      recordedByName: m.recordedBy?.name ?? null,
    }));
  }
}

function membershipRows(
  leadResearcherId: string | null | undefined,
  collaboratorIds: string[] | undefined,
): Array<{ researcherId: string; projectRole: ProjectRole }> {
  const rows: Array<{ researcherId: string; projectRole: ProjectRole }> = [];
  if (leadResearcherId) rows.push({ researcherId: leadResearcherId, projectRole: ProjectRole.LEAD });
  for (const cid of collaboratorIds ?? []) {
    if (cid === leadResearcherId) continue;
    rows.push({ researcherId: cid, projectRole: ProjectRole.COLLABORATOR });
  }
  return rows;
}
