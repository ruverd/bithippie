import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { AttachExperimentSampleService } from "../attach-experiment-sample.service";
import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";

let repo: InMemoryExperimentsRepository;
let service: AttachExperimentSampleService;

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
    {},
    [],
    ["p1"],
    { s1: { id: "s1", code: "S1", specimenType: "blood", storageLocation: null } },
  );
  service = new AttachExperimentSampleService(repo);
});

describe("AttachExperimentSampleService", () => {
  it("should attach a sample to an experiment", async () => {
    await service.execute("e1", "s1");
    expect(await repo.listSamples("e1")).toHaveLength(1);
  });

  it("should be idempotent", async () => {
    await service.execute("e1", "s1");
    await service.execute("e1", "s1");
    expect(await repo.listSamples("e1")).toHaveLength(1);
  });

  it("should throw NotFoundError for an unknown experiment", async () => {
    await expect(service.execute("nope", "s1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should throw ValidationError for an unknown sample", async () => {
    await expect(service.execute("e1", "nope")).rejects.toBeInstanceOf(ValidationError);
  });
});
