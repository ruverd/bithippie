import { expect, test } from "@playwright/test";

test.describe("GET /samples", () => {
  test("should returns ≥2 samples with experiment counts", async ({ request }) => {
    const res = await request.get("/samples");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(2);
    const blood = body.find((s) => s.id === "seed-sample-blood");
    expect(blood?.code).toBe("BLD-001");
    expect(typeof blood?.experimentCount).toBe("number");
    expect(blood?.experimentCount as number).toBeGreaterThanOrEqual(1);
  });
});
