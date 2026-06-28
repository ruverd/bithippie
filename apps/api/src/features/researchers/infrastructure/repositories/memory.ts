import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";
import type { CreateResearcherInput, Researcher, UpdateResearcherInput } from "../../domain/researcher";
import type { ResearchersRepository } from "../../domain/researchers.repository";

export class InMemoryResearchersRepository implements ResearchersRepository {
  private seq = 0;
  constructor(private researchers: Researcher[] = []) {}
  async list() {
    return this.researchers;
  }
  async create(input: CreateResearcherInput): Promise<Researcher> {
    if (this.researchers.some((r) => r.email === input.email)) {
      throw new ValidationError(`Email "${input.email}" is already in use`);
    }
    this.seq += 1;
    const created: Researcher = {
      id: `mem-res-${this.seq}`,
      name: input.name,
      email: input.email,
      globalRole: input.globalRole,
      projectCount: input.projectId && input.projectRole ? 1 : 0,
      measurementCount: 0,
    };
    this.researchers.push(created);
    return created;
  }

  async update(id: string, input: UpdateResearcherInput): Promise<Researcher> {
    const existing = this.researchers.find((r) => r.id === id);
    if (!existing) throw new NotFoundError(`Researcher ${id} not found`);
    if (input.email !== undefined && this.researchers.some((r) => r.id !== id && r.email === input.email)) {
      throw new ValidationError(`Email "${input.email}" is already in use`);
    }
    if (input.name !== undefined) existing.name = input.name;
    if (input.email !== undefined) existing.email = input.email;
    if (input.globalRole !== undefined) existing.globalRole = input.globalRole;
    return existing;
  }
}
