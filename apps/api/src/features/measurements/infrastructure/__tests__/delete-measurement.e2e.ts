import { expect, test } from "@playwright/test";

test.describe("DELETE /measurements/:measurementId", () => {
  test("should delete a measurement and 404 on a missing one", async ({ request }) => {
    const created = (await (
      await request.post("/experiments/seed-exp-1/measurements", {
        data: {
          measurementDefinitionId: "seed-def-lead",
          numericValue: 3.3,
          unit: "mg/L",
          sampleIds: ["seed-sample-blood"],
        },
      })
    ).json()) as Record<string, unknown>;

    const res = await request.delete(`/measurements/${created.id as string}`);
    expect(res.status()).toBe(204);

    const missing = await request.delete("/measurements/nope");
    expect(missing.status()).toBe(404);
  });
});
