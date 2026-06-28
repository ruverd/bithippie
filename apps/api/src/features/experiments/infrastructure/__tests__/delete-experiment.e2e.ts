import { expect, test } from "@playwright/test";

test.describe("DELETE /experiments/:experimentId", () => {
  test("should delete an experiment and 404 on a missing one", async ({ request }) => {
    const created = (await (
      await request.post("/experiments", {
        data: { title: "E2E-Exp To Delete", projectId: "seed-project-water" },
      })
    ).json()) as Record<string, unknown>;

    const res = await request.delete(`/experiments/${created.id as string}`);
    expect(res.status()).toBe(204);

    const missing = await request.delete("/experiments/nope");
    expect(missing.status()).toBe(404);
  });
});
