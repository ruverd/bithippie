import type { PrismaClient } from "@prisma/client";
import type { CreateSampleInput, UpdateSampleInput } from "../../domain/sample";
import type { SamplesRepository } from "../../domain/samples.repository";

export class PrismaSamplesRepository implements SamplesRepository {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateSampleInput) {
    const s = await this.prisma.sample.create({
      data: {
        code: input.code,
        specimenType: input.specimenType,
        collectedAt: input.collectedAt ? new Date(input.collectedAt) : null,
        storageLocation: input.storageLocation ?? null,
      },
      include: { _count: { select: { experiments: true } } },
    });
    return this.toDto(s);
  }

  async update(id: string, input: UpdateSampleInput) {
    const s = await this.prisma.sample.update({
      where: { id },
      data: {
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.specimenType !== undefined ? { specimenType: input.specimenType } : {}),
        ...(input.collectedAt !== undefined
          ? { collectedAt: input.collectedAt ? new Date(input.collectedAt) : null }
          : {}),
        ...(input.storageLocation !== undefined
          ? { storageLocation: input.storageLocation ?? null }
          : {}),
      },
      include: { _count: { select: { experiments: true } } },
    });
    return this.toDto(s);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sample.delete({ where: { id } });
  }

  async list() {
    return (
      await this.prisma.sample.findMany({
        orderBy: { code: "asc" },
        include: { _count: { select: { experiments: true } } },
      })
    ).map(this.toDto);
  }

  async findById(id: string) {
    const s = await this.prisma.sample.findUnique({
      where: { id },
      include: { _count: { select: { experiments: true } } },
    });
    return s ? this.toDto(s) : null;
  }

  private toDto = (s: {
    id: string;
    code: string;
    specimenType: string;
    collectedAt: Date | null;
    storageLocation: string | null;
    _count: { experiments: number };
  }) => ({
    id: s.id,
    code: s.code,
    specimenType: s.specimenType,
    collectedAt: s.collectedAt?.toISOString() ?? null,
    storageLocation: s.storageLocation,
    experimentCount: s._count.experiments,
  });
}
