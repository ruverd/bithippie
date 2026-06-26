import { beforeAll, describe, expect, it } from "vitest";
import { seed } from "../../../../../prisma/seed";
import { buildApp } from "../../../../app";
import { buildContainer } from "../../../../container";
import { getPrisma } from "../../../../infrastructure/prisma";

const prisma = getPrisma();
const app = buildApp(buildContainer(prisma));
const post = (experimentId: string, body: unknown) =>
  app.handle(
    new Request(`http://localhost/experiments/${experimentId}/measurements`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
const getAll = () => app.handle(new Request("http://localhost/measurements"));

beforeAll(async () => {
  await seed(prisma);
});

describe("POST measurements (integration)", () => {
  it("creates a numeric measurement (201)", async () => {
    const res = await post("seed-exp-1", {
      measurementDefinitionId: "seed-def-lead",
      numericValue: 7.7,
      unit: "mg/L",
      sampleIds: ["seed-sample-blood"],
    });
    expect(res.status).toBe(201);
    expect((await res.json()).numericValue).toBe(7.7);
  });

  it("rejects a categorical value outside the allowed list (422)", async () => {
    const res = await post("seed-exp-1", {
      measurementDefinitionId: "seed-def-screen",
      categoricalValue: "maybe",
    });
    expect(res.status).toBe(422);
  });

  it("rejects a sample not on the experiment (422)", async () => {
    const res = await post("seed-exp-1", {
      measurementDefinitionId: "seed-def-lead",
      numericValue: 1,
      sampleIds: ["seed-sample-soil"],
    });
    expect(res.status).toBe(422);
  });

  it("returns 404 for an unknown experiment", async () => {
    const res = await post("nope", { measurementDefinitionId: "seed-def-lead", numericValue: 1 });
    expect(res.status).toBe(404);
  });

  it("rejects a malformed body (422 from Zod)", async () => {
    const res = await post("seed-exp-1", { numericValue: 1 }); // missing measurementDefinitionId
    expect(res.status).toBe(422);
  });
});

describe("GET /measurements (integration)", () => {
  it("lists seeded measurements enriched with experiment and recorder names", async () => {
    const res = await getAll();
    expect(res.status).toBe(200);
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    expect(rows.length).toBeGreaterThanOrEqual(5);

    const lead = rows.find((r) => r.id === "seed-meas-lead-1");
    expect(lead).toMatchObject({
      experimentId: "seed-exp-1",
      experimentName: "Baseline lead screening",
      definitionName: "Lead concentration",
      valueType: "NUMERIC",
      numericValue: 12.4,
      unit: "mg/L",
      recordedByName: "Alice Nguyen",
    });
  });

  it("returns rows ordered by recordedAt descending", async () => {
    const rows = (await (await getAll()).json()) as Array<{ recordedAt: string }>;
    const times = rows.map((r) => new Date(r.recordedAt).getTime());
    const sorted = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sorted);
  });
});
