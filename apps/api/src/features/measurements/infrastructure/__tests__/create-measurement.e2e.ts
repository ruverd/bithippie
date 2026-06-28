import { expect, test } from "@playwright/test";

test.describe("POST /experiments/:experimentId/measurements", () => {
  test("should creates a numeric measurement (201)", async ({ request }) => {
    const res = await request.post("/experiments/seed-exp-1/measurements", {
      data: {
        measurementDefinitionId: "seed-def-lead",
        numericValue: 7.7,
        unit: "mg/L",
        sampleIds: ["seed-sample-blood"],
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.numericValue).toBe(7.7);
  });

  test("should rejects a categorical value outside the allowed list (422)", async ({ request }) => {
    const res = await request.post("/experiments/seed-exp-1/measurements", {
      data: {
        measurementDefinitionId: "seed-def-screen",
        categoricalValue: "maybe",
      },
    });
    expect(res.status()).toBe(422);
  });

  test("should rejects a sample not on the experiment (422)", async ({ request }) => {
    const res = await request.post("/experiments/seed-exp-1/measurements", {
      data: {
        measurementDefinitionId: "seed-def-lead",
        numericValue: 1,
        sampleIds: ["seed-sample-soil"],
      },
    });
    expect(res.status()).toBe(422);
  });

  test("should returns 404 for an unknown experiment", async ({ request }) => {
    const res = await request.post("/experiments/nope/measurements", {
      data: { measurementDefinitionId: "seed-def-lead", numericValue: 1 },
    });
    expect(res.status()).toBe(404);
  });

  test("should rejects a malformed body (422 from Zod)", async ({ request }) => {
    const res = await request.post("/experiments/seed-exp-1/measurements", {
      data: { numericValue: 1 }, // missing measurementDefinitionId
    });
    expect(res.status()).toBe(422);
  });
});
