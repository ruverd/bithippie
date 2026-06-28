import { expect, test } from "@playwright/test";

test.describe("POST /experiments", () => {
  test("should creates an experiment (201) and rejects an unknown project (422)", async ({ request }) => {
    const ok = await request.post("/experiments", {
      data: {
        title: "E2E-Created Experiment",
        hypothesis: "h",
        projectId: "seed-project-water",
        status: "PLANNING",
      },
    });
    expect(ok.status()).toBe(201);
    expect(((await ok.json()) as Record<string, unknown>).title).toBe("E2E-Created Experiment");

    const bad = await request.post("/experiments", {
      data: { title: "E2E-x", projectId: "nope" },
    });
    expect(bad.status()).toBe(422);
  });
});
