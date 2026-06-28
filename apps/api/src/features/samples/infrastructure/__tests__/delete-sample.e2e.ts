import { expect, test } from "@playwright/test";

test.describe("DELETE /samples/:sampleId", () => {
  test("should delete a sample and 404 on a missing one", async ({ request }) => {
    const created = (await (
      await request.post("/samples", {
        data: { code: "E2E-SAMPLE-DELETE", specimenType: "blood" },
      })
    ).json()) as Record<string, unknown>;

    const res = await request.delete(`/samples/${created.id as string}`);
    expect(res.status()).toBe(204);

    const missing = await request.delete("/samples/nope");
    expect(missing.status()).toBe(404);
  });
});
