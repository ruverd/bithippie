import { Prisma } from "@prisma/client";
import { ValidationError } from "../../../shared/domain/errors";
import type { CreateSampleInput, Sample } from "../domain/sample";
import type { SamplesRepository } from "../domain/samples.repository";

export class CreateSampleService {
  constructor(private readonly repo: SamplesRepository) {}

  async execute(input: CreateSampleInput): Promise<Sample> {
    try {
      return await this.repo.create(input);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ValidationError(`Sample code "${input.code}" already exists`);
      }
      throw e;
    }
  }
}
