import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { GetProjectService } from "../get-project.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetProjectService;
beforeEach(() => {
  service = new GetProjectService(
    new InMemoryProjectsRepository([
      { id: "p1", title: "Water", description: null, status: "ACTIVE" },
    ]),
  );
});

describe("GetProjectService", () => {
  it("should gets a project by id", async () => {
    expect((await service.execute("p1")).title).toBe("Water");
  });
  it("should throws NotFoundError for a missing project", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
