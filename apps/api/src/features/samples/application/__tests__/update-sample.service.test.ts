import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySamplesRepository } from "../../infrastructure/repositories/memory";
import { UpdateSampleService } from "../update-sample.service";
import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";

let repo: InMemorySamplesRepository;
let service: UpdateSampleService;

beforeEach(() => {
  repo = new InMemorySamplesRepository([
    {
      id: "s1",
      code: "BLOOD-001",
      specimenType: "blood",
      collectedAt: null,
      storageLocation: null,
      experimentCount: 0,
    },
    {
      id: "s2",
      code: "BLOOD-002",
      specimenType: "blood",
      collectedAt: null,
      storageLocation: null,
      experimentCount: 0,
    },
  ]);
  service = new UpdateSampleService(repo);
});

describe("UpdateSampleService", () => {
  it("should update an existing sample", async () => {
    const result = await service.execute("s1", { specimenType: "serum", storageLocation: "Freezer A" });
    expect(result.specimenType).toBe("serum");
    expect(result.storageLocation).toBe("Freezer A");
  });

  it("should throw NotFoundError when the sample does not exist", async () => {
    await expect(service.execute("nope", { specimenType: "serum" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("should throw ValidationError when the new code collides", async () => {
    await expect(service.execute("s1", { code: "BLOOD-002" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
