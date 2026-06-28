import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { DetachExperimentSampleService } from "../detach-experiment-sample.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemoryExperimentsRepository;
let service: DetachExperimentSampleService;

beforeEach(() => {
  repo = new InMemoryExperimentsRepository(
    [
      {
        id: "e1",
        title: "E1",
        hypothesis: null,
        status: null,
        projectId: "p1",
        previousExperimentId: null,
        startDate: null,
        endDate: null,
      },
    ],
    {},
    { e1: [{ id: "s1", code: "S1", specimenType: "blood", storageLocation: null }] },
    [],
    ["p1"],
  );
  service = new DetachExperimentSampleService(repo);
});

describe("DetachExperimentSampleService", () => {
  it("should detach a sample from an experiment", async () => {
    await service.execute("e1", "s1");
    expect(await repo.listSamples("e1")).toHaveLength(0);
  });

  it("should be idempotent when the sample is not attached", async () => {
    await service.execute("e1", "nope");
    expect(await repo.listSamples("e1")).toHaveLength(1);
  });

  it("should throw NotFoundError for an unknown experiment", async () => {
    await expect(service.execute("nope", "s1")).rejects.toBeInstanceOf(NotFoundError);
  });
});
