import { describe, expect, it } from "vitest";
import { measurementValue } from "./measurement-value";

const base = {
  numericValue: null,
  unit: null,
  categoricalValue: null,
  textValue: null,
} as const;

describe("measurementValue", () => {
  it("should formats a numeric value with its unit", () => {
    expect(measurementValue({ ...base, valueType: "NUMERIC", numericValue: 12.4, unit: "mg/L" })).toBe(
      "12.4 mg/L",
    );
  });

  it("should formats a numeric value without a unit", () => {
    expect(measurementValue({ ...base, valueType: "NUMERIC", numericValue: 7 })).toBe("7");
  });

  it("should returns an em dash for a missing numeric value", () => {
    expect(measurementValue({ ...base, valueType: "NUMERIC" })).toBe("—");
  });

  it("should returns the categorical value as-is", () => {
    expect(measurementValue({ ...base, valueType: "CATEGORICAL", categoricalValue: "positive" })).toBe(
      "positive",
    );
  });

  it("should returns an em dash for a missing categorical value", () => {
    expect(measurementValue({ ...base, valueType: "CATEGORICAL" })).toBe("—");
  });

  it("should wraps text values in curly quotes", () => {
    expect(measurementValue({ ...base, valueType: "TEXT", textValue: "looks turbid" })).toBe(
      "“looks turbid”",
    );
  });

  it("should returns an em dash for a missing text value", () => {
    expect(measurementValue({ ...base, valueType: "TEXT" })).toBe("—");
  });
});
