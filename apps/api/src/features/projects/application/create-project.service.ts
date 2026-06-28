import { ValidationError } from "../../../shared/domain/errors";
import type { CreateProjectInput, ProjectDetail } from "../domain/project";
import type { ProjectsRepository } from "../domain/projects.repository";

export class CreateProjectService {
  constructor(private readonly repo: ProjectsRepository) {}

  async execute(input: CreateProjectInput): Promise<ProjectDetail> {
    await this.assertResearchersExist(input.leadResearcherId, input.collaboratorIds);
    return this.repo.create(input);
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
