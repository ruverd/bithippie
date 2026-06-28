import { expect, test } from "@playwright/test";

test.describe("GET /experiments/:experimentId/measurements", () => {
  test("should returns ≥3 measurements with numeric, categorical and text values", async ({ request }) => {
    const res = await request.get("/experiments/seed-exp-1/measurements");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(3);

    const numeric = body.find((m) => m.valueType === "NUMERIC");
    const categorical = body.find((m) => m.valueType === "CATEGORICAL");
    const text = body.find((m) => m.valueType === "TEXT");
    expect(numeric).toBeDefined();
    expect(typeof numeric?.numericValue).toBe("number");
    expect(categorical).toBeDefined();
    expect(text).toBeDefined();

    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("definitionName");
    expect(body[0]).toHaveProperty("recordedAt");
  });

  test("should returns 404 for an unknown experiment", async ({ request }) => {
    const res = await request.get("/experiments/nope/measurements");
    expect(res.status()).toBe(404);
  });
});
