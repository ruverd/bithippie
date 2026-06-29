import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("should join class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("should drop falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("should resolve conflicting tailwind classes with the last winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should support conditional object syntax", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
