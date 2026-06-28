import { expect, test } from "@playwright/test";

test.describe("PATCH /measurements/:measurementId", () => {
  test("should update a measurement value and reject a type mismatch", async ({ request }) => {
    const res = await request.patch("/measurements/seed-meas-lead-1", {
      data: { numericValue: 99.9, unit: "mg/L" },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.numericValue).toBe(99.9);

    const mismatch = await request.patch("/measurements/seed-meas-lead-1", {
      data: { textValue: "not numeric" },
    });
    expect(mismatch.status()).toBe(422);

    const missing = await request.patch("/measurements/nope", { data: { numericValue: 1 } });
    expect(missing.status()).toBe(404);
  });
});
