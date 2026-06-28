import { expect, test } from "@playwright/test";

test.describe("GET /projects/:projectId/researchers", () => {
  test("should returns project members", async ({ request }) => {
    const res = await request.get("/projects/seed-project-water/researchers");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(3);
  });
});
