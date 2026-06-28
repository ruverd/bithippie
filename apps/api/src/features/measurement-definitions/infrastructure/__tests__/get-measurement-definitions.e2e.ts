import { expect, test } from "@playwright/test";

test.describe("GET /measurement-definitions", () => {
  test("should returns the seeded definitions", async ({ request }) => {
    const res = await request.get("/measurement-definitions");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(4);
    const names = body.map((d) => d.name);
    for (const anchored of [
      "Lead concentration",
      "Temperature",
      "Screening result",
      "Researcher observation",
    ]) {
      expect(names).toContain(anchored);
    }
    const lead = body.find((d) => d.id === "seed-def-lead");
    expect(lead?.name).toBe("Lead concentration");
  });

  test("should includes one with non-empty allowedCategories", async ({ request }) => {
    const res = await request.get("/measurement-definitions");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    const withCategories = body.find(
      (d) => Array.isArray(d.allowedCategories) && (d.allowedCategories as unknown[]).length > 0,
    );
    expect(withCategories).toBeDefined();
  });
});
