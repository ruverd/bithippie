import type { CreateResearcherInput, Researcher, UpdateResearcherInput } from "./researcher";

export interface ResearchersRepository {
  list(): Promise<Researcher[]>;
  create(input: CreateResearcherInput): Promise<Researcher>;
  update(id: string, input: UpdateResearcherInput): Promise<Researcher>;
}
