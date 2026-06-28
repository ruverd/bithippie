import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("should returns an em dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("should returns an em dash for an empty string", () => {
    expect(formatDate("")).toBe("—");
  });

  it("should returns an em dash for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });

  it("should formats a valid ISO date as 'Mon DD, YYYY'", () => {
    // Noon UTC so the day never crosses a boundary regardless of test timezone.
    expect(formatDate("2026-06-03T12:00:00.000Z")).toMatch(/^Jun \d{2}, 2026$/);
  });
});
