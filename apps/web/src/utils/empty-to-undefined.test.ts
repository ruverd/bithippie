import { describe, expect, it } from "vitest";
import { emptyToUndefined } from "./empty-to-undefined";

describe("emptyToUndefined", () => {
  it("should maps undefined to undefined", () => {
    expect(emptyToUndefined(undefined)).toBeUndefined();
  });

  it("should maps an empty string to undefined", () => {
    expect(emptyToUndefined("")).toBeUndefined();
  });

  it("should passes through a non-empty string", () => {
    expect(emptyToUndefined("hello")).toBe("hello");
  });
});
