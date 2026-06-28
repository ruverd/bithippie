import type { CreateProjectInput, UpdateProjectInput } from "../../domain/project";
import type { ProjectsServices } from "../../application/services";

type ResponseSet = { status?: number | string };

export class ProjectsController {
  constructor(private readonly services: ProjectsServices) {}

  getProjects() {
    return this.services.getProjects.execute();
  }

  async createProject(body: CreateProjectInput, set: ResponseSet) {
    const result = await this.services.createProject.execute(body);
    set.status = 201;
    return result;
  }

  getProject(id: string) {
    return this.services.getProject.execute(id);
  }

  updateProject(id: string, body: UpdateProjectInput) {
    return this.services.updateProject.execute(id, body);
  }

  getProjectResearchers(id: string) {
    return this.services.getProjectResearchers.execute(id);
  }

  getProjectExperiments(id: string) {
    return this.services.getProjectExperiments.execute(id);
  }

  getProjectSamples(id: string) {
    return this.services.getProjectSamples.execute(id);
  }

  getProjectMeasurements(id: string) {
    return this.services.getProjectMeasurements.execute(id);
  }
}
