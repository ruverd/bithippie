import type { Researcher } from "../domain/researcher";
import type { ResearchersRepository } from "../domain/researchers.repository";

export class GetResearchersService {
  constructor(private readonly repo: ResearchersRepository) {}

  execute(): Promise<Researcher[]> {
    return this.repo.list();
  }
}
