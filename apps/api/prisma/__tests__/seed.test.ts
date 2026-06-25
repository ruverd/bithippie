import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { seed } from "../seed";

const prisma = new PrismaClient();

beforeAll(async () => {
  await seed(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("seed data", () => {
  it("water project has multiple researchers", async () => {
    const count = await prisma.projectResearcher.count({ where: { projectId: "seed-project-water" } });
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it("a researcher collaborates on more than one project", async () => {
    const count = await prisma.projectResearcher.count({ where: { researcherId: "seed-researcher-bob" } });
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("exp2 is a follow-up of exp1", async () => {
    const exp2 = await prisma.experiment.findUniqueOrThrow({ where: { id: "seed-exp-2" } });
    expect(exp2.previousExperimentId).toBe("seed-exp-1");
  });

  it("the blood sample is reused across multiple experiments", async () => {
    const count = await prisma.experimentSample.count({ where: { sampleId: "seed-sample-blood" } });
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("has numeric, categorical and text measurements", async () => {
    const numeric = await prisma.measurement.findFirst({ where: { id: { startsWith: "seed-meas-" }, numericValue: { not: null } } });
    const categorical = await prisma.measurement.findFirst({ where: { id: { startsWith: "seed-meas-" }, categoricalValue: { not: null } } });
    const text = await prisma.measurement.findFirst({ where: { id: { startsWith: "seed-meas-" }, textValue: { not: null } } });
    expect(numeric).not.toBeNull();
    expect(categorical).not.toBeNull();
    expect(text).not.toBeNull();
  });

  it("has a measurement with a sample and one without", async () => {
    const withSample = await prisma.measurementSample.count({ where: { measurementId: "seed-meas-lead-1" } });
    const withoutSample = await prisma.measurementSample.count({ where: { measurementId: "seed-meas-obs-1" } });
    expect(withSample).toBeGreaterThanOrEqual(1);
    expect(withoutSample).toBe(0);
  });

  it("is idempotent (second run does not duplicate)", async () => {
    await seed(prisma);
    const measurements = await prisma.measurement.count({ where: { id: { startsWith: "seed-meas-" } } });
    expect(measurements).toBe(5);
  });
});
