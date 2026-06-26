import type { PrismaClient } from "@prisma/client";
import type { SamplesRepository } from "../../domain/samples.repository";

export class PrismaSamplesRepository implements SamplesRepository {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return (await this.prisma.sample.findMany({ orderBy: { code: "asc" } })).map(this.toDto);
  }

  async findById(id: string) {
    const s = await this.prisma.sample.findUnique({ where: { id } });
    return s ? this.toDto(s) : null;
  }

  private toDto = (s: {
    id: string;
    code: string;
    specimenType: string;
    collectedAt: Date | null;
    storageLocation: string | null;
  }) => ({
    id: s.id,
    code: s.code,
    specimenType: s.specimenType,
    collectedAt: s.collectedAt?.toISOString() ?? null,
    storageLocation: s.storageLocation,
  });
}
