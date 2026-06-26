import type { PrismaClient } from "@prisma/client";
import type { ProjectsRepository } from "../../domain/projects.repository";
import { toProject } from "../mappers";

export class PrismaProjectsRepository implements ProjectsRepository {
  constructor(private prisma: PrismaClient) {}
  async list() {
    return (await this.prisma.project.findMany({ orderBy: { title: "asc" } })).map(toProject);
  }
  async findById(id: string) {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row ? toProject(row) : null;
  }
  async listResearchers(projectId: string) {
    const rows = await this.prisma.projectResearcher.findMany({
      where: { projectId }, include: { researcher: true },
    });
    return rows.map((r) => ({
      researcherId: r.researcherId, name: r.researcher.name, email: r.researcher.email,
      globalRole: r.researcher.globalRole, projectRole: r.projectRole,
    }));
  }
  async listExperiments(projectId: string) {
    return (await this.prisma.experiment.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }))
      .map((e) => ({ id: e.id, title: e.title, status: e.status, previousExperimentId: e.previousExperimentId }));
  }
}
