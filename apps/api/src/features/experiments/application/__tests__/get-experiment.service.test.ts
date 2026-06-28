import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { GetExperimentService } from "../get-experiment.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetExperimentService;

beforeEach(() => {
  service = new GetExperimentService(
    new InMemoryExperimentsRepository([
      {
        id: "e1",
        title: "Exp One",
        hypothesis: "Water is wet",
        status: "ACTIVE",
        projectId: "p1",
        previousExperimentId: null,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: null,
      },
    ]),
  );
});

describe("GetExperimentService", () => {
  it("should gets an experiment by id", async () => {
    const result = await service.execute("e1");
    expect(result.title).toBe("Exp One");
  });

  it("should throws NotFoundError for a missing experiment", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
