import { expect, test } from "@playwright/test";

test.describe("PATCH /researchers/:researcherId", () => {
  test("should update a researcher's editable fields (200)", async ({ request }) => {
    const res = await request.patch("/researchers/seed-researcher-bob", {
      data: { name: "E2E Bob Renamed", globalRole: "POSTDOC" },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.id).toBe("seed-researcher-bob");
    expect(body.name).toBe("E2E Bob Renamed");
    expect(body.globalRole).toBe("POSTDOC");
  });

  test("should reject an email already in use (422)", async ({ request }) => {
    const res = await request.patch("/researchers/seed-researcher-bob", {
      data: { email: "alice@lab.test" },
    });
    expect(res.status()).toBe(422);
  });

  test("should return 404 for an unknown researcher", async ({ request }) => {
    const res = await request.patch("/researchers/nope", { data: { name: "X" } });
    expect(res.status()).toBe(404);
  });
});
