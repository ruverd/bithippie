import { expect, test } from "@playwright/test";

test.describe("GET /openapi/json", () => {
  test("should serves an OpenAPI document", async ({ request }) => {
    const res = await request.get("/openapi/json");
    expect(res.status()).toBe(200);
  });

  test("should documents measurementDefinitionId in the create-measurement requestBody", async ({ request }) => {
    const res = await request.get("/openapi/json");
    const doc = (await res.json()) as Record<string, unknown>;
    const paths = doc.paths as Record<string, unknown>;
    const post = (paths["/experiments/{experimentId}/measurements"] as Record<string, unknown>)?.post as Record<string, unknown>;
    expect(post).toBeDefined();
    const requestBody = post.requestBody as Record<string, unknown>;
    expect(requestBody).toBeDefined();
    const schema = (requestBody.content as Record<string, unknown>)?.["application/json"] as Record<string, unknown>;
    const properties = (schema?.schema as Record<string, unknown>)?.properties as Record<string, unknown>;
    expect(properties).toHaveProperty("measurementDefinitionId");
  });
});
