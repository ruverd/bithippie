import { describe, expect, it } from "vitest";
import { getResearchers } from "../get-researchers";
import { InMemoryResearchersRepository } from "../../infrastructure/repositories/memory";
import type { Researcher } from "../../domain/researcher";

const alice: Researcher = {
  id: "r1",
  name: "Alice Nguyen",
  email: "alice@lab.test",
  globalRole: "PRINCIPAL_INVESTIGATOR",
  projectCount: 2,
  measurementCount: 2,
};

describe("getResearchers", () => {
  it("returns the enriched researcher rows", async () => {
    const repo = new InMemoryResearchersRepository([alice]);
    expect(await getResearchers(repo)).toEqual([alice]);
  });

  it("returns an empty array when none exist", async () => {
    const repo = new InMemoryResearchersRepository();
    expect(await getResearchers(repo)).toEqual([]);
  });
});
