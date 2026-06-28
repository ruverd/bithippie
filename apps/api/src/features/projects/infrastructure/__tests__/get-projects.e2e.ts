import { expect, test } from "@playwright/test";

test.describe("GET /projects", () => {
  test("should returns seeded projects", async ({ request }) => {
    const res = await request.get("/projects");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(2);
    const water = body.find((p) => p.id === "seed-project-water");
    expect(water?.title).toBe("Municipal Water Quality");
  });
});
