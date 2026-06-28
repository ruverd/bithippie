import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { DeleteExperimentService } from "../delete-experiment.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemoryExperimentsRepository;
let service: DeleteExperimentService;

beforeEach(() => {
  repo = new InMemoryExperimentsRepository(
    [
      {
        id: "e1",
        title: "Exp One",
        hypothesis: null,
        status: "PLANNING",
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
  );
  service = new DeleteExperimentService(repo);
});

describe("DeleteExperimentService", () => {
  it("should delete an existing experiment", async () => {
    await service.execute("e1");
    expect(await repo.findById("e1")).toBeNull();
  });

  it("should throw NotFoundError when the experiment does not exist", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
