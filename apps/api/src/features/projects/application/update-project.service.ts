import { ValidationError, NotFoundError } from "../../../shared/domain/errors";
import type { ProjectDetail, UpdateProjectInput } from "../domain/project";
import type { ProjectsRepository } from "../domain/projects.repository";

export class UpdateProjectService {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(id: string, input: UpdateProjectInput): Promise<ProjectDetail> {
    if (!(await this.repo.findById(id))) throw new NotFoundError(`Project ${id} not found`);
    await this.assertResearchersExist(input.leadResearcherId, input.collaboratorIds);
    return this.repo.update(id, input);
  }

  private async assertResearchersExist(
    leadResearcherId?: string | null,
    collaboratorIds?: string[],
  ): Promise<void> {
    const ids = [
      ...(leadResearcherId ? [leadResearcherId] : []),
      ...(collaboratorIds ?? []),
    ];
    if (ids.length === 0) return;
    const missing = await this.repo.missingResearchers(ids);
    if (missing.length > 0) {
      throw new ValidationError(`Researcher(s) not found: ${missing.join(", ")}`);
    }
  }
}
