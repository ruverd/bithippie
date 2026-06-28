import { expect, test } from "@playwright/test";

test.describe("GET /samples/:sampleId", () => {
  test("should returns 200 for a seeded sample", async ({ request }) => {
    const res = await request.get("/samples/seed-sample-blood");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.id).toBe("seed-sample-blood");
  });

  test("should returns 404 for an unknown sample", async ({ request }) => {
    const res = await request.get("/samples/unknown");
    expect(res.status()).toBe(404);
  });
});
