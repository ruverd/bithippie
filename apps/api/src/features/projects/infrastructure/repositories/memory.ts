import type { Project, ProjectExperiment, ResearcherMembership } from "../../domain/project";
import type { ProjectsRepository } from "../../domain/projects.repository";

export class InMemoryProjectsRepository implements ProjectsRepository {
  constructor(
    private projects: Project[] = [],
    private researchers: Record<string, ResearcherMembership[]> = {},
    private experiments: Record<string, ProjectExperiment[]> = {},
  ) {}
  async list() { return this.projects; }
  async findById(id: string) { return this.projects.find((p) => p.id === id) ?? null; }
  async listResearchers(projectId: string) { return this.researchers[projectId] ?? []; }
  async listExperiments(projectId: string) { return this.experiments[projectId] ?? []; }
}
