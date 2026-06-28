import { NotFoundError } from "../../../shared/domain/errors";
import type { ProjectsRepository } from "../domain/projects.repository";

export class GetProjectService {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(id: string) {
    const project = await this.repo.findDetail(id);
    if (!project) throw new NotFoundError(`Project ${id} not found`);
    return project;
  }
}
