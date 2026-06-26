import { beforeAll, describe, expect, it } from "vitest";
import { seed } from "../../../../../prisma/seed";
import { buildApp } from "../../../../app";
import { buildContainer } from "../../../../container";
import { getPrisma } from "../../../../infrastructure/prisma";

const prisma = getPrisma();
const app = buildApp(buildContainer(prisma));

beforeAll(async () => { await seed(prisma); });

describe("experiments routes (integration)", () => {
  it("GET /experiments/seed-exp-1 returns experiment detail", async () => {
    const res = await app.handle(new Request("http://localhost/experiments/seed-exp-1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("seed-exp-1");
    expect(body.title).toBeDefined();
  });

  it("GET /experiments/nope returns 404", async () => {
    const res = await app.handle(new Request("http://localhost/experiments/nope"));
    expect(res.status).toBe(404);
  });

  it("GET /experiments/seed-exp-1/measurements returns ≥3 measurements", async () => {
    const res = await app.handle(new Request("http://localhost/experiments/seed-exp-1/measurements"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(3);
    const numeric = body.find((m: Record<string, unknown>) => m.valueType === "NUMERIC");
    const categorical = body.find((m: Record<string, unknown>) => m.valueType === "CATEGORICAL");
    const text = body.find((m: Record<string, unknown>) => m.valueType === "TEXT");
    expect(numeric).toBeDefined();
    expect(typeof numeric.numericValue).toBe("number");
    expect(categorical).toBeDefined();
    expect(text).toBeDefined();
    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("definitionName");
    expect(body[0]).toHaveProperty("recordedAt");
  });

  it("GET /experiments/nope/measurements returns 404", async () => {
    const res = await app.handle(new Request("http://localhost/experiments/nope/measurements"));
    expect(res.status).toBe(404);
  });

  it("GET /experiments/seed-exp-1/samples returns the blood sample", async () => {
    const res = await app.handle(new Request("http://localhost/experiments/seed-exp-1/samples"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(1);
    const blood = body.find((s: Record<string, unknown>) => s.id === "seed-sample-blood");
    expect(blood).toBeDefined();
  });
});
