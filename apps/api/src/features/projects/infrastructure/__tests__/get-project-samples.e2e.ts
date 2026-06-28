import { expect, test } from "@playwright/test";

test.describe("GET /projects/:projectId/samples", () => {
  test("should returns project-scoped samples", async ({ request }) => {
    const res = await request.get("/projects/seed-project-water/samples");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(body)).toBe(true);
  });
});
