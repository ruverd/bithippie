import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { getProject } from "../get-project";
import { getProjectExperiments } from "../get-project-experiments";
import { getProjectResearchers } from "../get-project-researchers";
import { getProjects } from "../get-projects";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemoryProjectsRepository;
beforeEach(() => {
  repo = new InMemoryProjectsRepository(
    [{ id: "p1", title: "Water", description: null, status: "ACTIVE" }],
    {
      p1: [
        { researcherId: "r1", name: "Alice", email: "alice@example.com", globalRole: "ADMIN", projectRole: "LEAD" },
        { researcherId: "r2", name: "Bob", email: "bob@example.com", globalRole: "RESEARCHER", projectRole: "MEMBER" },
      ],
    },
    {
      p1: [
        { id: "e1", title: "Exp One", status: "ACTIVE", previousExperimentId: null },
        { id: "e2", title: "Exp Two", status: "DRAFT", previousExperimentId: "e1" },
      ],
    },
  );
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

  describe("getProjectResearchers", () => {
    it("returns researchers for an existing project", async () => {
      const result = await getProjectResearchers(repo, "p1");
      expect(result).toHaveLength(2);
      expect(result[0].researcherId).toBe("r1");
    });
    it("throws NotFoundError for an unknown project id", async () => {
      await expect(getProjectResearchers(repo, "nope")).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("getProjectExperiments", () => {
    it("returns experiments for an existing project", async () => {
      const result = await getProjectExperiments(repo, "p1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("e1");
    });
    it("throws NotFoundError for an unknown project id", async () => {
      await expect(getProjectExperiments(repo, "nope")).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
