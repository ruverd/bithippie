import { Prisma } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../shared/domain/errors";
import type { Researcher, UpdateResearcherInput } from "../domain/researcher";
import type { ResearchersRepository } from "../domain/researchers.repository";

export class UpdateResearcherService {
  constructor(private readonly repo: ResearchersRepository) {}

  async execute(id: string, input: UpdateResearcherInput): Promise<Researcher> {
    try {
      return await this.repo.update(id, input);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") throw new NotFoundError(`Researcher ${id} not found`);
        if (e.code === "P2002") throw new ValidationError(`Email "${input.email}" is already in use`);
      }
      throw e;
    }
  }
}
