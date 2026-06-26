import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { getProject } from "../get-project";
import { getProjects } from "../get-projects";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemoryProjectsRepository;
beforeEach(() => {
  repo = new InMemoryProjectsRepository([
    { id: "p1", title: "Water", description: null, status: "ACTIVE" },
  ]);
});

describe("projects use cases", () => {
  it("lists projects", async () => {
    expect(await getProjects(repo)).toHaveLength(1);
  });
  it("gets a project by id", async () => {
    expect((await getProject(repo, "p1")).title).toBe("Water");
  });
  it("throws NotFoundError for a missing project", async () => {
    await expect(getProject(repo, "nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
