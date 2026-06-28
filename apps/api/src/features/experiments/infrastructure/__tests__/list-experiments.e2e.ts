import { expect, test } from "@playwright/test";

test.describe("GET /experiments", () => {
  test("should lists experiments enriched with project, lead and measurement count", async ({ request }) => {
    const res = await request.get("/experiments");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThanOrEqual(3);

    const exp1 = body.find((e) => e.id === "seed-exp-1");
    expect(exp1?.title).toBe("Baseline lead screening");
    expect(exp1?.projectName).toBe("Municipal Water Quality");
    expect(exp1?.leadName).toBe("Alice Nguyen");
    expect(typeof exp1?.measurementCount).toBe("number");
    expect(exp1?.measurementCount as number).toBeGreaterThanOrEqual(3);
  });
});
