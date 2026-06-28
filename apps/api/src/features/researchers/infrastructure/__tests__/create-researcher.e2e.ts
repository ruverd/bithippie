import { expect, test } from "@playwright/test";

test.describe("POST /researchers", () => {
  test("should invites a researcher (201) and assigns to a project", async ({ request }) => {
    const payload = {
      name: "E2E Dr. Maya Okonjo",
      email: "e2e.maya.okonjo@int-test.bio",
      globalRole: "POSTDOC",
      projectId: "seed-project-water",
      projectRole: "COLLABORATOR",
    };

    const res = await request.post("/researchers", { data: payload });
    expect(res.status()).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.name).toBe("E2E Dr. Maya Okonjo");
    expect(body.projectCount).toBe(1);
  });

  test("should rejects a duplicate email (422)", async ({ request }) => {
    const payload = {
      name: "E2E Dup",
      email: "alice@lab.test",
      globalRole: "POSTDOC",
    };

    const res = await request.post("/researchers", { data: payload });
    expect(res.status()).toBe(422);
  });
});
