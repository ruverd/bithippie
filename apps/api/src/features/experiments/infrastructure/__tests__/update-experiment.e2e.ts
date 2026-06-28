import { expect, test } from "@playwright/test";

test.describe("PATCH /experiments/:experimentId", () => {
  test("should update fields and reject an unknown project", async ({ request }) => {
    const created = (await (
      await request.post("/experiments", {
        data: { title: "E2E-Exp To Edit", projectId: "seed-project-water", status: "PLANNING" },
      })
    ).json()) as Record<string, unknown>;

    const res = await request.patch(`/experiments/${created.id as string}`, {
      data: { title: "E2E-Exp Edited", status: "ACTIVE" },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.title).toBe("E2E-Exp Edited");
    expect(body.status).toBe("ACTIVE");

    const bad = await request.patch(`/experiments/${created.id as string}`, {
      data: { projectId: "nope" },
    });
    expect(bad.status()).toBe(422);
  });
});
