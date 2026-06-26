import { NotFoundError } from "../../../shared/domain/errors";
import type { ProjectsRepository } from "../domain/projects.repository";
export async function getProject(repo: ProjectsRepository, id: string) {
  const project = await repo.findById(id);
  if (!project) throw new NotFoundError(`Project ${id} not found`);
  return project;
}
