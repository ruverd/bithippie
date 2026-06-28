import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { relativeTime } from "./relative-time";

const NOW = new Date("2026-06-15T12:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

function ago(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

describe("relativeTime", () => {
  it("should returns an em dash for an invalid date", () => {
    expect(relativeTime("nope")).toBe("—");
  });

  it("should says 'Just now' under a minute", () => {
    expect(relativeTime(ago(30_000))).toBe("Just now");
  });

  it("should reports minutes", () => {
    expect(relativeTime(ago(5 * 60_000))).toBe("5m ago");
  });

  it("should reports hours", () => {
    expect(relativeTime(ago(3 * 3_600_000))).toBe("3h ago");
  });

  it("should says 'Yesterday' at one day", () => {
    expect(relativeTime(ago(24 * 3_600_000))).toBe("Yesterday");
  });

  it("should reports days under a week", () => {
    expect(relativeTime(ago(4 * 24 * 3_600_000))).toBe("4d ago");
  });

  it("should falls back to a locale date beyond a week", () => {
    const iso = ago(10 * 24 * 3_600_000);
    expect(relativeTime(iso)).toBe(new Date(iso).toLocaleDateString());
  });
});
