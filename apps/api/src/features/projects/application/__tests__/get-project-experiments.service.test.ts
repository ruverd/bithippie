import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { GetProjectExperimentsService } from "../get-project-experiments.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetProjectExperimentsService;
beforeEach(() => {
  service = new GetProjectExperimentsService(
    new InMemoryProjectsRepository(
      [{ id: "p1", title: "Water", description: null, status: "ACTIVE" }],
      {},
      {
        p1: [
          { id: "e1", title: "Exp One", status: "ACTIVE", previousExperimentId: null },
          { id: "e2", title: "Exp Two", status: "DRAFT", previousExperimentId: "e1" },
        ],
      },
    ),
  );
});

describe("GetProjectExperimentsService", () => {
  it("should returns experiments for an existing project", async () => {
    const result = await service.execute("p1");
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("e1");
  });
  it("should throws NotFoundError for an unknown project id", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
