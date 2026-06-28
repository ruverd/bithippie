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
  it("should be idempotent (a second run does not duplicate rows)", async () => {
    await seed(prisma);
    const measurements = await prisma.measurement.count({
      where: { id: { startsWith: "seed-meas-" } },
    });
    expect(measurements).toBe(5);
  });
});
