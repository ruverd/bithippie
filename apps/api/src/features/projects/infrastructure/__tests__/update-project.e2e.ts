import { expect, test } from "@playwright/test";

test.describe("PATCH /projects/:projectId", () => {
  test("should updates fields and reconciles the lead", async ({ request }) => {
    const created = (await (
      await request.post("/projects", {
        data: { title: "E2E To Edit", leadResearcherId: "seed-researcher-bob" },
      })
    ).json()) as Record<string, unknown>;

    const res = await request.patch(`/projects/${created.id as string}`, {
      data: { title: "E2E Edited Title", leadResearcherId: "seed-researcher-carol" },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.title).toBe("E2E Edited Title");
    expect(body.leadName).toBe("Carol Tan");
  });
});
