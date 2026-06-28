import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySamplesRepository } from "../../infrastructure/repositories/memory";
import { GetSamplesService } from "../get-samples.service";

let service: GetSamplesService;

beforeEach(() => {
  service = new GetSamplesService(
    new InMemorySamplesRepository([
      { id: "s1", code: "BLOOD-001", specimenType: "blood", collectedAt: "2024-01-01T00:00:00.000Z", storageLocation: "-80C", experimentCount: 2 },
      { id: "s2", code: "SOIL-001", specimenType: "soil", collectedAt: null, storageLocation: "Room temp", experimentCount: 1 },
    ]),
  );
});

describe("GetSamplesService", () => {
  it("should lists all samples", async () => {
    const result = await service.execute();
    expect(result).toHaveLength(2);
  });
});
