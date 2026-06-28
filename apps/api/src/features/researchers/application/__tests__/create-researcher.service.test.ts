import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryResearchersRepository } from "../../infrastructure/repositories/memory";
import { CreateResearcherService } from "../create-researcher.service";

let service: CreateResearcherService;

beforeEach(() => {
  service = new CreateResearcherService(new InMemoryResearchersRepository());
});

describe("CreateResearcherService", () => {
  it("should creates a researcher", async () => {
    const result = await service.execute({
      name: "Alice Nguyen",
      email: "alice@lab.test",
      globalRole: "PRINCIPAL_INVESTIGATOR",
    });
    expect(result.id).toBeTruthy();
    expect(result.name).toBe("Alice Nguyen");
    expect(result.email).toBe("alice@lab.test");
    expect(result.globalRole).toBe("PRINCIPAL_INVESTIGATOR");
  });
});
