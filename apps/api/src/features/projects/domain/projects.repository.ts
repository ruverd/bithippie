import type {
  CreateProjectInput,
  Project,
  ProjectDetail,
  ProjectExperiment,
  ProjectListItem,
  ProjectMeasurement,
  ProjectSample,
  ResearcherMembership,
  UpdateProjectInput,
} from "./project";

export interface ProjectsRepository {
  list(): Promise<ProjectListItem[]>;
  findById(id: string): Promise<Project | null>;
  findDetail(id: string): Promise<ProjectDetail | null>;
  create(input: CreateProjectInput): Promise<ProjectDetail>;
  update(id: string, input: UpdateProjectInput): Promise<ProjectDetail>;
  missingResearchers(ids: string[]): Promise<string[]>;
  listResearchers(projectId: string): Promise<ResearcherMembership[]>;
  listExperiments(projectId: string): Promise<ProjectExperiment[]>;
  listSamples(projectId: string): Promise<ProjectSample[]>;
  listMeasurements(projectId: string): Promise<ProjectMeasurement[]>;
}
