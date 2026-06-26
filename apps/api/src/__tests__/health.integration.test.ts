import { describe, expect, it } from "vitest";
import { buildApp } from "../app";
import { buildContainer } from "../container";
import { getPrisma } from "../infrastructure/prisma";

const app = buildApp(buildContainer(getPrisma()));

describe("health + openapi", () => {
  it("GET /health returns ok", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
  it("serves an OpenAPI document", async () => {
    const res = await app.handle(new Request("http://localhost/openapi/json"));
    expect(res.status).toBe(200);
  });

  it("POST /experiments/{experimentId}/measurements includes a requestBody with measurementDefinitionId", async () => {
    const res = await app.handle(new Request("http://localhost/openapi/json"));
    const doc = await res.json() as Record<string, unknown>;
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
