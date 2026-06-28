import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { GetExperimentSamplesService } from "../get-experiment-samples.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetExperimentSamplesService;

beforeEach(() => {
  service = new GetExperimentSamplesService(
    new InMemoryExperimentsRepository(
      [
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
      ],
      {},
      {
        e1: [{ id: "s1", code: "BLOOD-001", specimenType: "blood", storageLocation: "-80C" }],
      },
    ),
  );
});

describe("GetExperimentSamplesService", () => {
  it("should lists samples for an experiment", async () => {
    const result = await service.execute("e1");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("BLOOD-001");
  });

  it("should throws NotFoundError for samples of unknown experiment", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
