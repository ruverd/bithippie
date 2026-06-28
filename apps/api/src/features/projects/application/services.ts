import type { ProjectsRepository } from "../domain/projects.repository";
import { CreateProjectService } from "./create-project.service";
import { GetProjectService } from "./get-project.service";
import { GetProjectsService } from "./get-projects.service";
import { UpdateProjectService } from "./update-project.service";
import { GetProjectResearchersService } from "./get-project-researchers.service";
import { GetProjectExperimentsService } from "./get-project-experiments.service";
import { GetProjectSamplesService } from "./get-project-samples.service";
import { GetProjectMeasurementsService } from "./get-project-measurements.service";

export interface ProjectsServices {
  createProject: CreateProjectService;
  getProject: GetProjectService;
  getProjects: GetProjectsService;
  updateProject: UpdateProjectService;
  getProjectResearchers: GetProjectResearchersService;
  getProjectExperiments: GetProjectExperimentsService;
  getProjectSamples: GetProjectSamplesService;
  getProjectMeasurements: GetProjectMeasurementsService;
}

export function buildProjectsServices(repo: ProjectsRepository): ProjectsServices {
  return {
    createProject: new CreateProjectService(repo),
    getProject: new GetProjectService(repo),
    getProjects: new GetProjectsService(repo),
    updateProject: new UpdateProjectService(repo),
    getProjectResearchers: new GetProjectResearchersService(repo),
    getProjectExperiments: new GetProjectExperimentsService(repo),
    getProjectSamples: new GetProjectSamplesService(repo),
    getProjectMeasurements: new GetProjectMeasurementsService(repo),
  };
}
