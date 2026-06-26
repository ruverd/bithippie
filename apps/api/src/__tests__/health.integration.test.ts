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
});
