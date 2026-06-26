import { beforeAll, describe, expect, it } from "vitest";
import { seed } from "../../../../../prisma/seed";
import { buildApp } from "../../../../app";
import { buildContainer } from "../../../../container";
import { getPrisma } from "../../../../infrastructure/prisma";

const prisma = getPrisma();
const app = buildApp(buildContainer(prisma));

beforeAll(async () => { await seed(prisma); });

describe("measurement-definitions routes (integration)", () => {
  it("GET /measurement-definitions returns the 4 seeded definitions", async () => {
    const res = await app.handle(new Request("http://localhost/measurement-definitions"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBe(4);
  });

  it("GET /measurement-definitions includes one with non-empty allowedCategories", async () => {
    const res = await app.handle(new Request("http://localhost/measurement-definitions"));
    expect(res.status).toBe(200);
    const body = await res.json();
    const withCategories = body.find(
      (d: Record<string, unknown>) => Array.isArray(d.allowedCategories) && (d.allowedCategories as unknown[]).length > 0,
    );
    expect(withCategories).toBeDefined();
  });
});
