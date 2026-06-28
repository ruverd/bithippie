import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { CreateExperimentService } from "../create-experiment.service";
import { ValidationError } from "../../../../shared/domain/errors";

let service: CreateExperimentService;

const seedExperiment = (id: string, projectId: string) => ({
  id,
  title: id,
  hypothesis: null,
  status: null,
  projectId,
  previousExperimentId: null,
  startDate: null,
  endDate: null,
});

beforeEach(() => {
  service = new CreateExperimentService(
    new InMemoryExperimentsRepository(
      [seedExperiment("prev", "p1"), seedExperiment("other-project", "p2")],
      {},
      {},
      [],
      ["p1", "p2"],
    ),
  );
});

describe("CreateExperimentService", () => {
  it("should creates an experiment", async () => {
    const result = await service.execute({ title: "Exp One", projectId: "p1" });
    expect(result.id).toBeTruthy();
    expect(result.title).toBe("Exp One");
    expect(result.projectId).toBe("p1");
  });

  it("should throws ValidationError when the project does not exist", async () => {
    await expect(service.execute({ title: "Exp One", projectId: "nope" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("should create a follow-up that points at an experiment in the same project", async () => {
    const result = await service.execute({
      title: "Replication",
      projectId: "p1",
      previousExperimentId: "prev",
    });
    expect(result.previousExperimentId).toBe("prev");
  });

  it("should reject a follow-up whose previous experiment does not exist", async () => {
    await expect(
      service.execute({ title: "x", projectId: "p1", previousExperimentId: "missing" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("should reject a follow-up pointing at an experiment in another project", async () => {
    await expect(
      service.execute({ title: "x", projectId: "p1", previousExperimentId: "other-project" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
