import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient, ValueType } from "@prisma/client";

const prisma = new PrismaClient();

const EXPERIMENT_ID = "test-exp-constraints";
const DEFINITION_ID = "test-def-constraints";
const PROJECT_ID = "test-project-constraints";

beforeAll(async () => {
  await prisma.project.create({
    data: { id: PROJECT_ID, title: "Constraints fixture", status: "ACTIVE" },
  });
  await prisma.experiment.create({
    data: { id: EXPERIMENT_ID, title: "Constraints fixture exp", projectId: PROJECT_ID },
  });
  await prisma.measurementDefinition.create({
    data: { id: DEFINITION_ID, name: "Constraints fixture def", valueType: ValueType.NUMERIC },
  });
});

afterAll(async () => {
  await prisma.measurement.deleteMany({ where: { experimentId: EXPERIMENT_ID } });
  await prisma.experiment.delete({ where: { id: EXPERIMENT_ID } });
  await prisma.measurementDefinition.delete({ where: { id: DEFINITION_ID } });
  await prisma.project.delete({ where: { id: PROJECT_ID } });
  await prisma.$disconnect();
});

describe("measurements_exactly_one_value CHECK", () => {
  it("accepts exactly one value column", async () => {
    const m = await prisma.measurement.create({
      data: { experimentId: EXPERIMENT_ID, measurementDefinitionId: DEFINITION_ID, numericValue: 12.4, unit: "mg/L" },
    });
    expect(m.id).toBeTruthy();
    await prisma.measurement.delete({ where: { id: m.id } });
  });

  it("rejects two value columns", async () => {
    await expect(
      prisma.measurement.create({
        data: { experimentId: EXPERIMENT_ID, measurementDefinitionId: DEFINITION_ID, numericValue: 1, textValue: "x" },
      }),
    ).rejects.toThrow(/measurements_exactly_one_value/);
  });

  it("rejects zero value columns", async () => {
    await expect(
      prisma.measurement.create({
        data: { experimentId: EXPERIMENT_ID, measurementDefinitionId: DEFINITION_ID },
      }),
    ).rejects.toThrow(/measurements_exactly_one_value/);
  });
});
