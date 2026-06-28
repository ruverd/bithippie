import { expect, test } from "@playwright/test";

test.describe("GET /experiments/:experimentId", () => {
  test("should returns experiment detail for a seeded experiment", async ({ request }) => {
    const res = await request.get("/experiments/seed-exp-1");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.id).toBe("seed-exp-1");
    expect(body.title).toBeDefined();
  });

  test("should returns 404 for an unknown experiment", async ({ request }) => {
    const res = await request.get("/experiments/nope");
    expect(res.status()).toBe(404);
  });
});
