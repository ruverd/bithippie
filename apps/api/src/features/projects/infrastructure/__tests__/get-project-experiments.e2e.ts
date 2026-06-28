import { expect, test } from "@playwright/test";

test.describe("GET /projects/:projectId/experiments", () => {
  test("should returns project experiments", async ({ request }) => {
    const res = await request.get("/projects/seed-project-water/experiments");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(2);
  });
});
