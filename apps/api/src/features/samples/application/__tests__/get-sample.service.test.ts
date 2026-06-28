import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySamplesRepository } from "../../infrastructure/repositories/memory";
import { GetSampleService } from "../get-sample.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetSampleService;

beforeEach(() => {
  service = new GetSampleService(
    new InMemorySamplesRepository([
      { id: "s1", code: "BLOOD-001", specimenType: "blood", collectedAt: "2024-01-01T00:00:00.000Z", storageLocation: "-80C", experimentCount: 2 },
    ]),
  );
});

describe("GetSampleService", () => {
  it("should gets a sample by id", async () => {
    const result = await service.execute("s1");
    expect(result.code).toBe("BLOOD-001");
  });

  it("should throws NotFoundError for a missing sample", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
