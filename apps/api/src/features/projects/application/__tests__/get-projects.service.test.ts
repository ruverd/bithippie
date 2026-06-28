import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { GetProjectsService } from "../get-projects.service";

let service: GetProjectsService;
beforeEach(() => {
  service = new GetProjectsService(
    new InMemoryProjectsRepository([
      { id: "p1", title: "Water", description: null, status: "ACTIVE" },
    ]),
  );
});

describe("GetProjectsService", () => {
  it("should lists projects", async () => {
    expect(await service.execute()).toHaveLength(1);
  });
});
