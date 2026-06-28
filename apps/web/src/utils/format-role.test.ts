import { describe, expect, it } from "vitest";
import { formatRole } from "./format-role";

describe("formatRole", () => {
  it("should title-cases a single-word role", () => {
    expect(formatRole("LEAD")).toBe("Lead");
  });

  it("should title-cases each underscore-separated word", () => {
    expect(formatRole("PRINCIPAL_INVESTIGATOR")).toBe("Principal Investigator");
  });

  it("should normalizes already-lowercase input", () => {
    expect(formatRole("graduate_student")).toBe("Graduate Student");
  });
});
