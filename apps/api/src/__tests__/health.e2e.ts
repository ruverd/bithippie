import { expect, test } from "@playwright/test";

test.describe("GET /health", () => {
  test("should returns ok", async ({ request }) => {
    const res = await request.get("/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
