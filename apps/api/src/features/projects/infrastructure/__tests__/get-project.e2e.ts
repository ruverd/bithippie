import { expect, test } from "@playwright/test";

test.describe("GET /projects/:projectId", () => {
  test("should returns enriched detail for a seeded project", async ({ request }) => {
    const res = await request.get("/projects/seed-project-water");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.id).toBe("seed-project-water");
    expect(body.leadName).toBe("Alice Nguyen");
    expect(typeof body.experimentCount).toBe("number");
    expect(typeof body.sampleCount).toBe("number");
    expect(typeof body.createdAt).toBe("string");
  });

  test("should returns 404 for an unknown project", async ({ request }) => {
    const res = await request.get("/projects/nope");
    expect(res.status()).toBe(404);
  });
});
