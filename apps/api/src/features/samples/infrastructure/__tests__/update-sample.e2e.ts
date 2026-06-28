import { expect, test } from "@playwright/test";

test.describe("PATCH /samples/:sampleId", () => {
  test("should update a sample and 404 on a missing one", async ({ request }) => {
    const created = (await (
      await request.post("/samples", {
        data: { code: "E2E-SAMPLE-PATCH", specimenType: "blood" },
      })
    ).json()) as Record<string, unknown>;

    const res = await request.patch(`/samples/${created.id as string}`, {
      data: { specimenType: "serum", storageLocation: "Freezer Z" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.specimenType).toBe("serum");
    expect(body.storageLocation).toBe("Freezer Z");

    const missing = await request.patch("/samples/nope", { data: { specimenType: "serum" } });
    expect(missing.status()).toBe(404);
  });
});
