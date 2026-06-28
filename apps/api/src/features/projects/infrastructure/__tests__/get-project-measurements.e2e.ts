import { expect, test } from "@playwright/test";

test.describe("GET /projects/:projectId/measurements", () => {
  test("should returns project-scoped measurements with experiment names", async ({ request }) => {
    const res = await request.get("/projects/seed-project-water/measurements");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body[0]).toHaveProperty("experimentName");
  });
});
