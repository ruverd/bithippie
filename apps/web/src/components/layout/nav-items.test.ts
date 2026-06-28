import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "./nav-items";

describe("NAV_ITEMS", () => {
  it("lists the six menu pages in order", () => {
    expect(NAV_ITEMS.map((i) => i.label)).toEqual([
      "Dashboard",
      "Projects",
      "Experiments",
      "Samples",
      "Measurements",
      "Researchers",
    ]);
  });

  it("maps labels to routes", () => {
    expect(NAV_ITEMS.map((i) => i.to)).toEqual([
      "/",
      "/projects",
      "/experiments",
      "/samples",
      "/measurements",
      "/researchers",
    ]);
  });
});
