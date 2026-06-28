import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { UpdateProjectService } from "../update-project.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: UpdateProjectService;
beforeEach(() => {
  service = new UpdateProjectService(
    new InMemoryProjectsRepository([
      { id: "p1", title: "Water", description: null, status: "ACTIVE" },
    ]),
  );
});

describe("UpdateProjectService", () => {
  it("should updates a project", async () => {
    const result = await service.execute("p1", { title: "Ice" });
    expect(result.title).toBe("Ice");
  });
  it("should throws NotFoundError for a missing project", async () => {
    await expect(service.execute("nope", { title: "Ice" })).rejects.toBeInstanceOf(NotFoundError);
  });
});
