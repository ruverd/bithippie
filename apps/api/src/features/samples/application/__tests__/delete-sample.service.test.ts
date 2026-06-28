import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySamplesRepository } from "../../infrastructure/repositories/memory";
import { DeleteSampleService } from "../delete-sample.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemorySamplesRepository;
let service: DeleteSampleService;

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
  ]);
  service = new DeleteSampleService(repo);
});

describe("DeleteSampleService", () => {
  it("should delete an existing sample", async () => {
    await service.execute("s1");
    expect(await repo.findById("s1")).toBeNull();
  });

  it("should throw NotFoundError when the sample does not exist", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
