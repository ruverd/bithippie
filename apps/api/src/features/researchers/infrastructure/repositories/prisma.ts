import type { PrismaClient } from "@prisma/client";
import type { Researcher } from "../../domain/researcher";
import type { ResearchersRepository } from "../../domain/researchers.repository";

export class PrismaResearchersRepository implements ResearchersRepository {
  constructor(private prisma: PrismaClient) {}

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
