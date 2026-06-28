import { describe, expect, it } from "vitest";
import { GetResearchersService } from "../get-researchers.service";
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

describe("GetResearchersService", () => {
  it("should returns the enriched researcher rows", async () => {
    const service = new GetResearchersService(new InMemoryResearchersRepository([alice]));
    expect(await service.execute()).toEqual([alice]);
  });

  it("should returns an empty array when none exist", async () => {
    const service = new GetResearchersService(new InMemoryResearchersRepository());
    expect(await service.execute()).toEqual([]);
  });
});
