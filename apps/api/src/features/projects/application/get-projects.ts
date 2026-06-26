import type { ProjectsRepository } from "../domain/projects.repository";
export const getProjects = (repo: ProjectsRepository) => repo.list();
