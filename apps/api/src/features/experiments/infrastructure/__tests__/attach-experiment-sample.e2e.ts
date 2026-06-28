import { expect, test } from "@playwright/test";

test.describe("POST/DELETE /experiments/:experimentId/samples", () => {
  test("should attach then detach a sample, with validation", async ({ request }) => {
    // seed-exp-3 (Soil pH survey) starts with only the soil sample.
    const attach = await request.post("/experiments/seed-exp-3/samples", {
      data: { sampleId: "seed-sample-blood" },
    });
    expect(attach.status()).toBe(204);

    const after = (await (await request.get("/experiments/seed-exp-3/samples")).json()) as Array<
      Record<string, unknown>
    >;
    expect(after.some((s) => s.id === "seed-sample-blood")).toBe(true);

    const detach = await request.delete("/experiments/seed-exp-3/samples/seed-sample-blood");
    expect(detach.status()).toBe(204);

    const cleaned = (await (await request.get("/experiments/seed-exp-3/samples")).json()) as Array<
      Record<string, unknown>
    >;
    expect(cleaned.some((s) => s.id === "seed-sample-blood")).toBe(false);
  });

  test("should 404 attaching to an unknown experiment", async ({ request }) => {
    const res = await request.post("/experiments/nope/samples", {
      data: { sampleId: "seed-sample-blood" },
    });
    expect(res.status()).toBe(404);
  });

  test("should 422 attaching an unknown sample", async ({ request }) => {
    const res = await request.post("/experiments/seed-exp-3/samples", {
      data: { sampleId: "nope" },
    });
    expect(res.status()).toBe(422);
  });
});
