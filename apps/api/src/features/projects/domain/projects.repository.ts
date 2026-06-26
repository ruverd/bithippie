import type { Project, ProjectExperiment, ResearcherMembership } from "./project";

export interface ProjectsRepository {
  list(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  listResearchers(projectId: string): Promise<ResearcherMembership[]>;
  listExperiments(projectId: string): Promise<ProjectExperiment[]>;
}
