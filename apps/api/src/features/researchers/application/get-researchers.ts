import type { ResearchersRepository } from "../domain/researchers.repository";

export const getResearchers = (repo: ResearchersRepository) => repo.list();
