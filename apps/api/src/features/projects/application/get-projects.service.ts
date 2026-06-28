import type { ProjectsRepository } from "../domain/projects.repository";

export class GetProjectsService {
  constructor(private readonly repo: ProjectsRepository) {}

  execute() {
    return this.repo.list();
  }
}
