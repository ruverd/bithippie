import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { GetProjectSamplesService } from "../get-project-samples.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetProjectSamplesService;
beforeEach(() => {
  service = new GetProjectSamplesService(
    new InMemoryProjectsRepository(
      [{ id: "p1", title: "Water", description: null, status: "ACTIVE" }],
      {},
      {},
      [],
      {
        p1: [
          { id: "s1", code: "BLOOD-001", specimenType: "blood", collectedAt: null, storageLocation: "-80C" },
        ],
      },
    ),
  );
});

describe("GetProjectSamplesService", () => {
  it("should returns samples for an existing project", async () => {
    const result = await service.execute("p1");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("BLOOD-001");
  });
  it("should throws NotFoundError for an unknown project id", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
