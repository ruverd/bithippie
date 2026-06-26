import type { Researcher } from "../../domain/researcher";
import type { ResearchersRepository } from "../../domain/researchers.repository";

export class InMemoryResearchersRepository implements ResearchersRepository {
  constructor(private researchers: Researcher[] = []) {}
  async list() {
    return this.researchers;
  }
}
