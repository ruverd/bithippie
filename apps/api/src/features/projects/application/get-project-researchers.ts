import { NotFoundError } from "../../../shared/domain/errors";
import type { ProjectsRepository } from "../domain/projects.repository";
export async function getProjectResearchers(repo: ProjectsRepository, id: string) {
  if (!(await repo.findById(id))) throw new NotFoundError(`Project ${id} not found`);
  return repo.listResearchers(id);
}
