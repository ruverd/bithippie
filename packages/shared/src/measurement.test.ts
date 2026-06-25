import { describe, expect, it } from "vitest";
import { validateMeasurementValue } from "./measurement";

const numericDef = { valueType: "NUMERIC" as const, allowedCategories: [] };
const catDef = { valueType: "CATEGORICAL" as const, allowedCategories: ["positive", "negative"] };
const textDef = { valueType: "TEXT" as const, allowedCategories: [] };

describe("validateMeasurementValue", () => {
  it("accepts a numeric value for a NUMERIC definition", () => {
    expect(validateMeasurementValue(numericDef, { numericValue: 12.4 })).toEqual({ ok: true });
  });
  it("rejects a NUMERIC definition without a numeric value", () => {
    expect(validateMeasurementValue(numericDef, { textValue: "x" }).ok).toBe(false);
  });
  it("accepts a categorical value within the allowed list", () => {
    expect(validateMeasurementValue(catDef, { categoricalValue: "positive" })).toEqual({ ok: true });
  });
  it("rejects a categorical value outside the allowed list", () => {
    const r = validateMeasurementValue(catDef, { categoricalValue: "maybe" });
    expect(r.ok).toBe(false);
  });
  it("rejects a CATEGORICAL definition given a numeric value", () => {
    expect(validateMeasurementValue(catDef, { numericValue: 1 }).ok).toBe(false);
  });
  it("accepts a text value for a TEXT definition", () => {
    expect(validateMeasurementValue(textDef, { textValue: "looks turbid" })).toEqual({ ok: true });
  });
  it("rejects more than one value field set", () => {
    expect(validateMeasurementValue(numericDef, { numericValue: 1, textValue: "x" }).ok).toBe(false);
  });
});
