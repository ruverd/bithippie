import { expect, test } from "@playwright/test";

test.describe("POST /projects", () => {
  test("should creates a project with lead + collaborators (201)", async ({ request }) => {
    const res = await request.post("/projects", {
      data: {
        title: "E2E Created Project",
        description: "via e2e test",
        status: "PLANNING",
        leadResearcherId: "seed-researcher-alice",
        collaboratorIds: ["seed-researcher-bob"],
      },
    });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.title).toBe("E2E Created Project");
    expect(body.leadName).toBe("Alice Nguyen");

    const members = (await (
      await request.get(`/projects/${body.id as string}/researchers`)
    ).json()) as Array<Record<string, unknown>>;
    expect(members.length).toBe(2);
  });

  test("should rejects an unknown lead researcher (422)", async ({ request }) => {
    const res = await request.post("/projects", {
      data: { title: "E2E Bad Lead", leadResearcherId: "nobody" },
    });
    expect(res.status()).toBe(422);
  });
});
