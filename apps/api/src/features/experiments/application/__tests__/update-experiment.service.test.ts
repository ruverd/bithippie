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
        {
          id: "e2",
          title: "Exp Two",
          hypothesis: null,
          status: "PLANNING",
          projectId: "p1",
          previousExperimentId: null,
          startDate: null,
          endDate: null,
        },
        {
          id: "e3",
          title: "Exp Three",
          hypothesis: null,
          status: "PLANNING",
          projectId: "p2",
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

  it("should set a follow-up to an experiment in the same project", async () => {
    const result = await service.execute("e1", { previousExperimentId: "e2" });
    expect(result.previousExperimentId).toBe("e2");
  });

  it("should reject an experiment that is a follow-up of itself", async () => {
    await expect(service.execute("e1", { previousExperimentId: "e1" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("should reject a follow-up pointing at a missing experiment", async () => {
    await expect(
      service.execute("e1", { previousExperimentId: "missing" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("should reject a follow-up pointing at an experiment in another project", async () => {
    await expect(service.execute("e1", { previousExperimentId: "e3" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
