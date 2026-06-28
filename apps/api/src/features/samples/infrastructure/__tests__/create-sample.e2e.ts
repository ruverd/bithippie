import { expect, test } from "@playwright/test";

test.describe("POST /samples", () => {
  test("should registers a sample (201) and rejects a duplicate code (422)", async ({ request }) => {
    const payload = {
      code: "E2E-SAMPLE-001",
      specimenType: "blood",
      collectedAt: "2026-06-01T00:00:00.000Z",
      storageLocation: "Freezer X",
    };

    const ok = await request.post("/samples", { data: payload });
    expect(ok.status()).toBe(201);
    expect((await ok.json()).code).toBe("E2E-SAMPLE-001");

    const dup = await request.post("/samples", { data: payload });
    expect(dup.status()).toBe(422);
  });
});
