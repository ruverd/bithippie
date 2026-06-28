import { NotFoundError } from "../../../shared/domain/errors";
import type { ProjectsRepository } from "../domain/projects.repository";

export class GetProjectMeasurementsService {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(id: string) {
    if (!(await this.repo.findById(id))) throw new NotFoundError(`Project ${id} not found`);
    return this.repo.listMeasurements(id);
  }
}
