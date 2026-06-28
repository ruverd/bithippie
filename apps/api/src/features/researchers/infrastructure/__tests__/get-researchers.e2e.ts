import { expect, test } from "@playwright/test";

test.describe("GET /researchers", () => {
  test("should lists researchers with project and measurement counts", async ({ request }) => {
    const res = await request.get("/researchers");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(3);

    const alice = body.find((r) => r.id === "seed-researcher-alice");
    expect(alice?.name).toBe("Alice Nguyen");
    expect(alice?.email).toBe("alice@lab.test");
    expect(alice?.globalRole).toBe("PRINCIPAL_INVESTIGATOR");
    expect(typeof alice?.projectCount).toBe("number");
    expect(alice?.projectCount as number).toBeGreaterThanOrEqual(2);
    expect(typeof alice?.measurementCount).toBe("number");
    expect(alice?.measurementCount as number).toBeGreaterThanOrEqual(2);
  });
});
