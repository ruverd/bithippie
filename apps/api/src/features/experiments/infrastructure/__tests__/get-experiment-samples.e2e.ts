import { expect, test } from "@playwright/test";

test.describe("GET /experiments/:experimentId/samples", () => {
  test("should returns the blood sample for a seeded experiment", async ({ request }) => {
    const res = await request.get("/experiments/seed-exp-1/samples");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(1);

    const blood = body.find((s) => s.id === "seed-sample-blood");
    expect(blood).toBeDefined();
  });

  test("should returns 404 for an unknown experiment", async ({ request }) => {
    const res = await request.get("/experiments/nope/samples");
    expect(res.status()).toBe(404);
  });
});
