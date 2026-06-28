import { expect, test } from "@playwright/test";

test.describe("GET /measurements", () => {
  test("should lists seeded measurements enriched with experiment and recorder names", async ({
    request,
  }) => {
    const res = await request.get("/measurements");
    expect(res.status()).toBe(200);
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    expect(rows.length).toBeGreaterThanOrEqual(5);

    const lead = rows.find((r) => r.id === "seed-meas-lead-1");
    expect(lead).toMatchObject({
      experimentId: "seed-exp-1",
      experimentName: "Baseline lead screening",
      definitionName: "Lead concentration",
      valueType: "NUMERIC",
      numericValue: 12.4,
      unit: "mg/L",
      recordedByName: "Alice Nguyen",
    });
  });

  test("should returns rows ordered by recordedAt descending", async ({ request }) => {
    const res = await request.get("/measurements");
    const rows = (await res.json()) as Array<{ recordedAt: string }>;
    const times = rows.map((r) => new Date(r.recordedAt).getTime());
    const sorted = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sorted);
  });
});
