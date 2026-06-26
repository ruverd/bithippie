import { beforeAll, describe, expect, it } from "vitest";
import { seed } from "../../../../../prisma/seed";
import { buildApp } from "../../../../app";
import { buildContainer } from "../../../../container";
import { getPrisma } from "../../../../infrastructure/prisma";

const prisma = getPrisma();
const app = buildApp(buildContainer(prisma));

beforeAll(async () => {
  await seed(prisma);
});

describe("researchers routes (integration)", () => {
  it("GET /researchers lists researchers with project and measurement counts", async () => {
    const res = await app.handle(new Request("http://localhost/researchers"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(3);

    const alice = body.find((r) => r.id === "seed-researcher-alice");
    expect(alice).toMatchObject({
      name: "Alice Nguyen",
      email: "alice@lab.test",
      globalRole: "PRINCIPAL_INVESTIGATOR",
    });
    expect(typeof alice?.projectCount).toBe("number");
    expect(alice?.projectCount).toBeGreaterThanOrEqual(2);
    expect(typeof alice?.measurementCount).toBe("number");
    expect(alice?.measurementCount).toBeGreaterThanOrEqual(2);
  });
});
