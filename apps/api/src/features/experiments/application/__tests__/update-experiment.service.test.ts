import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { UpdateExperimentService } from "../update-experiment.service";
import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";

let service: UpdateExperimentService;

beforeEach(() => {
  service = new UpdateExperimentService(
    new InMemoryExperimentsRepository(
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
      ["p1", "p2"],
    ),
  );
});

describe("UpdateExperimentService", () => {
  it("should update experiment fields", async () => {
    const result = await service.execute("e1", { title: "Edited", status: "ACTIVE" });
    expect(result.title).toBe("Edited");
    expect(result.status).toBe("ACTIVE");
  });

  it("should throw NotFoundError when the experiment does not exist", async () => {
    await expect(service.execute("nope", { title: "x" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should throw ValidationError when the target project does not exist", async () => {
    await expect(service.execute("e1", { projectId: "nope" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
