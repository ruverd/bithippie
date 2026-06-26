import { beforeAll, describe, expect, it } from "vitest";
import { seed } from "../../../../../prisma/seed";
import { buildApp } from "../../../../app";
import { buildContainer } from "../../../../container";
import { getPrisma } from "../../../../infrastructure/prisma";

const prisma = getPrisma();
const app = buildApp(buildContainer(prisma));

beforeAll(async () => { await seed(prisma); });

describe("samples routes (integration)", () => {
  it("GET /samples returns ≥2 samples with experiment counts", async () => {
    const res = await app.handle(new Request("http://localhost/samples"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(2);
    const blood = body.find((s) => s.id === "seed-sample-blood");
    expect(blood?.code).toBe("BLD-001");
    expect(typeof blood?.experimentCount).toBe("number");
    expect(blood?.experimentCount).toBeGreaterThanOrEqual(1);
  });

  it("GET /samples/seed-sample-blood returns 200", async () => {
    const res = await app.handle(new Request("http://localhost/samples/seed-sample-blood"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("seed-sample-blood");
  });

  it("GET /samples/unknown returns 404", async () => {
    const res = await app.handle(new Request("http://localhost/samples/unknown"));
    expect(res.status).toBe(404);
  });
});
