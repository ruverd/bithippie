import { beforeAll, describe, expect, it } from "vitest";
import { seed } from "../../../../../prisma/seed";
import { buildApp } from "../../../../app";
import { buildContainer } from "../../../../container";
import { getPrisma } from "../../../../infrastructure/prisma";

const prisma = getPrisma();
const app = buildApp(buildContainer(prisma));

beforeAll(async () => { await seed(prisma); });

describe("projects routes (integration)", () => {
  it("GET /projects returns seeded projects", async () => {
    const res = await app.handle(new Request("http://localhost/projects"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(2);
  });
  it("GET /projects/:id/researchers returns members", async () => {
    const res = await app.handle(new Request("http://localhost/projects/seed-project-water/researchers"));
    expect(res.status).toBe(200);
    expect((await res.json()).length).toBeGreaterThanOrEqual(3);
  });
  it("GET /projects/:id/experiments returns experiments", async () => {
    const res = await app.handle(new Request("http://localhost/projects/seed-project-water/experiments"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(2);
  });
  it("GET /projects/:id returns 404 for unknown id", async () => {
    const res = await app.handle(new Request("http://localhost/projects/nope"));
    expect(res.status).toBe(404);
  });
});
