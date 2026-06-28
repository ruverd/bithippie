import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { GetProjectResearchersService } from "../get-project-researchers.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetProjectResearchersService;
beforeEach(() => {
  service = new GetProjectResearchersService(
    new InMemoryProjectsRepository(
      [{ id: "p1", title: "Water", description: null, status: "ACTIVE" }],
      {
        p1: [
          { researcherId: "r1", name: "Alice", email: "alice@example.com", globalRole: "ADMIN", projectRole: "LEAD" },
          { researcherId: "r2", name: "Bob", email: "bob@example.com", globalRole: "RESEARCHER", projectRole: "MEMBER" },
        ],
      },
    ),
  );
});

describe("GetProjectResearchersService", () => {
  it("should returns researchers for an existing project", async () => {
    const result = await service.execute("p1");
    expect(result).toHaveLength(2);
    expect(result[0].researcherId).toBe("r1");
  });
  it("should throws NotFoundError for an unknown project id", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
