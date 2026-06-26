import type { PrismaClient } from "@prisma/client";
import type { MeasurementDefinitionsRepository } from "../../domain/measurement-definitions.repository";

export class PrismaMeasurementDefinitionsRepository implements MeasurementDefinitionsRepository {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return (
      await this.prisma.measurementDefinition.findMany({ orderBy: { name: "asc" } })
    ).map((d) => ({
      id: d.id,
      name: d.name,
      valueType: d.valueType,
      defaultUnit: d.defaultUnit,
      allowedCategories: d.allowedCategories,
      description: d.description,
    }));
  }
}
