import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  ProjectExperiment,
  ProjectMeasurement,
  ProjectSample,
  ResearcherMembership,
  UpdateProjectInput,
} from "../../domain/project";
import type { ProjectsRepository } from "../../domain/projects.repository";

export class InMemoryProjectsRepository implements ProjectsRepository {
  private seq = 0;
  constructor(
    private projects: Project[] = [],
    private researchers: Record<string, ResearcherMembership[]> = {},
    private experiments: Record<string, ProjectExperiment[]> = {},
    private knownResearcherIds: string[] = [],
    private samples: Record<string, ProjectSample[]> = {},
    private measurements: Record<string, ProjectMeasurement[]> = {},
    private researcherDirectory: Record<string, { name: string; email: string; globalRole: string }> = {},
  ) {}

  async list() {
    return this.projects.map((p) => ({
      ...p,
      experimentCount: (this.experiments[p.id] ?? []).length,
      updatedAt: new Date(0).toISOString(),
      team: (this.researchers[p.id] ?? []).map((m) => ({
        name: m.name,
        projectRole: m.projectRole,
      })),
    }));
  }

  async findById(id: string) {
    return this.projects.find((p) => p.id === id) ?? null;
  }

  async findDetail(id: string): Promise<ProjectDetail | null> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return null;
    const lead = (this.researchers[id] ?? []).find((m) => m.projectRole === "LEAD");
    return {
      ...project,
      createdAt: new Date(0).toISOString(),
      leadName: lead?.name ?? null,
      experimentCount: (this.experiments[id] ?? []).length,
      sampleCount: (this.samples[id] ?? []).length,
    };
  }

  async missingResearchers(ids: string[]) {
    return ids.filter((id) => !this.knownResearcherIds.includes(id));
  }

  async create(input: CreateProjectInput): Promise<ProjectDetail> {
    this.seq += 1;
    const id = `mem-proj-${this.seq}`;
    this.projects.push({
      id,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? null,
    });
    this.researchers[id] = membershipMemberships(
      input.leadResearcherId,
      input.collaboratorIds,
      this.researcherDirectory,
    );
    return (await this.findDetail(id))!;
  }

  async update(id: string, input: UpdateProjectInput): Promise<ProjectDetail> {
    const project = this.projects.find((p) => p.id === id);
    if (project) {
      if (input.title !== undefined) project.title = input.title;
      if (input.description !== undefined) project.description = input.description ?? null;
      if (input.status !== undefined) project.status = input.status ?? null;
    }
    if (input.leadResearcherId !== undefined || input.collaboratorIds !== undefined) {
      this.researchers[id] = membershipMemberships(
        input.leadResearcherId,
        input.collaboratorIds,
        this.researcherDirectory,
      );
    }
    return (await this.findDetail(id))!;
  }

  async listResearchers(projectId: string) {
    return [...(this.researchers[projectId] ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  }

  async listExperiments(projectId: string) {
    return [...(this.experiments[projectId] ?? [])].sort((a, b) => a.title.localeCompare(b.title));
  }

  async listSamples(projectId: string) {
    return this.samples[projectId] ?? [];
  }

  async listMeasurements(projectId: string) {
    return this.measurements[projectId] ?? [];
  }
}

function membershipMemberships(
  leadResearcherId: string | null | undefined,
  collaboratorIds: string[] | undefined,
  directory: Record<string, { name: string; email: string; globalRole: string }> = {},
): ResearcherMembership[] {
  const resolve = (id: string) => directory[id] ?? { name: id, email: "", globalRole: "" };
  const rows: ResearcherMembership[] = [];
  if (leadResearcherId) {
    rows.push({ researcherId: leadResearcherId, ...resolve(leadResearcherId), projectRole: "LEAD" });
  }
  for (const cid of collaboratorIds ?? []) {
    if (cid === leadResearcherId) continue;
    rows.push({ researcherId: cid, ...resolve(cid), projectRole: "COLLABORATOR" });
  }
  return rows;
}
