import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { CreateExperimentService } from "../create-experiment.service";
import { ValidationError } from "../../../../shared/domain/errors";

let service: CreateExperimentService;

beforeEach(() => {
  service = new CreateExperimentService(
    new InMemoryExperimentsRepository([], {}, {}, [], ["p1"]),
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
});
