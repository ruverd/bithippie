import { describe, expect, it } from "vitest";
import { initials, titleInitials } from "./initials";

describe("initials", () => {
  it("should takes the first letter of the first two words", () => {
    expect(initials("Alice Nguyen")).toBe("AN");
  });

  it("should uppercases", () => {
    expect(initials("alice nguyen")).toBe("AN");
  });

  it("should ignores honorifics ending in a dot", () => {
    expect(initials("Dr. Maya Okonjo")).toBe("MO");
  });

  it("should caps at two letters", () => {
    expect(initials("Alice Bob Carol")).toBe("AB");
  });

  it("should collapses extra whitespace", () => {
    expect(initials("Alice   Nguyen")).toBe("AN");
  });

  it("should handles a single name", () => {
    expect(initials("Alice")).toBe("A");
  });

  it("should returns an empty string for an empty name", () => {
    expect(initials("")).toBe("");
  });
});

describe("titleInitials", () => {
  it("should uppercases the first letter of up to three words", () => {
    expect(titleInitials("Municipal Water Quality")).toEqual(["M", "W", "Q"]);
  });

  it("should caps at three words", () => {
    expect(titleInitials("a b c d")).toEqual(["A", "B", "C"]);
  });
});
