import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { CreateProjectService } from "../create-project.service";

let service: CreateProjectService;
beforeEach(() => {
  service = new CreateProjectService(new InMemoryProjectsRepository());
});

describe("CreateProjectService", () => {
  it("should creates a project", async () => {
    const result = await service.execute({ title: "Water" });
    expect(result.id).toBeTruthy();
    expect(result.title).toBe("Water");
  });
});
