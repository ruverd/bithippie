import { Prisma } from "@prisma/client";
import { ValidationError } from "../../../shared/domain/errors";
import type { CreateResearcherInput, Researcher } from "../domain/researcher";
import type { ResearchersRepository } from "../domain/researchers.repository";

export class CreateResearcherService {
  constructor(private readonly repo: ResearchersRepository) {}

  async execute(input: CreateResearcherInput): Promise<Researcher> {
    try {
      return await this.repo.create(input);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ValidationError(`Email "${input.email}" is already in use`);
      }
      throw e;
    }
  }
}
