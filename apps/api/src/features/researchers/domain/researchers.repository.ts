import type { Researcher } from "./researcher";

export interface ResearchersRepository {
  list(): Promise<Researcher[]>;
}
