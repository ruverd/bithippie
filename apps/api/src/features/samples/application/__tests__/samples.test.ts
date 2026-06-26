import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySamplesRepository } from "../../infrastructure/repositories/memory";
import { getSamples } from "../get-samples";
import { getSample } from "../get-sample";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemorySamplesRepository;

beforeEach(() => {
  repo = new InMemorySamplesRepository([
    { id: "s1", code: "BLOOD-001", specimenType: "blood", collectedAt: "2024-01-01T00:00:00.000Z", storageLocation: "-80C", experimentCount: 2 },
    { id: "s2", code: "SOIL-001", specimenType: "soil", collectedAt: null, storageLocation: "Room temp", experimentCount: 1 },
  ]);
});

describe("samples use cases", () => {
  it("lists all samples", async () => {
    const result = await getSamples(repo);
    expect(result).toHaveLength(2);
  });

  it("gets a sample by id", async () => {
    const result = await getSample(repo, "s1");
    expect(result.code).toBe("BLOOD-001");
  });

  it("throws NotFoundError for a missing sample", async () => {
    await expect(getSample(repo, "nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
