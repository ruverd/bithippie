import { Prisma } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../../shared/domain/errors";
import type { Sample, UpdateSampleInput } from "../domain/sample";
import type { SamplesRepository } from "../domain/samples.repository";

export class UpdateSampleService {
  constructor(private readonly repo: SamplesRepository) {}

  async execute(id: string, input: UpdateSampleInput): Promise<Sample> {
    if (!(await this.repo.findById(id))) {
      throw new NotFoundError(`Sample ${id} not found`);
    }
    try {
      return await this.repo.update(id, input);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ValidationError(`Sample code "${input.code}" already exists`);
      }
      throw e;
    }
  }
}
