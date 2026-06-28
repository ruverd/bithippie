import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../repositories/memory";
import { buildProjectsServices } from "../../../application/services";
import { ProjectsController } from "../projects.controller";

let controller: ProjectsController;

beforeEach(() => {
  controller = new ProjectsController(
    buildProjectsServices(
      new InMemoryProjectsRepository([
        { id: "p1", title: "Water", description: null, status: "ACTIVE" },
      ]),
    ),
  );
});

describe("ProjectsController", () => {
  it("should getProject forwards to the service", async () => {
    const result = await controller.getProject("p1");
    expect(result.title).toBe("Water");
  });

  it("should createProject forwards to the service and sets status 201", async () => {
    const set: { status?: number | string } = {};
    const result = await controller.createProject({ title: "New" }, set);
    expect(set.status).toBe(201);
    expect(result.title).toBe("New");
  });
});
