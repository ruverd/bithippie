import { ProjectRole, ResearcherRole, type PrismaClient } from "@prisma/client";
import type {
  CreateResearcherInput,
  Researcher,
  UpdateResearcherInput,
} from "../../domain/researcher";
import type { ResearchersRepository } from "../../domain/researchers.repository";

export class PrismaResearchersRepository implements ResearchersRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateResearcherInput): Promise<Researcher> {
    const assign = input.projectId && input.projectRole;
    const created = await this.prisma.researcher.create({
      data: {
        name: input.name,
        email: input.email,
        globalRole: input.globalRole as ResearcherRole,
        ...(assign
          ? {
              projects: {
                create: [
                  {
                    projectId: input.projectId!,
                    projectRole: input.projectRole as ProjectRole,
                  },
                ],
              },
            }
          : {}),
      },
      include: { _count: { select: { projects: true, measurements: true } } },
    });
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      globalRole: created.globalRole,
      projectCount: created._count.projects,
      measurementCount: created._count.measurements,
    };
  }

  async update(id: string, input: UpdateResearcherInput): Promise<Researcher> {
    const updated = await this.prisma.researcher.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.globalRole !== undefined
          ? { globalRole: input.globalRole as ResearcherRole }
          : {}),
      },
      include: { _count: { select: { projects: true, measurements: true } } },
    });
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      globalRole: updated.globalRole,
      projectCount: updated._count.projects,
      measurementCount: updated._count.measurements,
    };
  }

  async list(): Promise<Researcher[]> {
    const rows = await this.prisma.researcher.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { projects: true, measurements: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      globalRole: r.globalRole,
      projectCount: r._count.projects,
      measurementCount: r._count.measurements,
    }));
  }
}
