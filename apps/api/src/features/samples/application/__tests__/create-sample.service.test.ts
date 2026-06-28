import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySamplesRepository } from "../../infrastructure/repositories/memory";
import { CreateSampleService } from "../create-sample.service";

let service: CreateSampleService;

beforeEach(() => {
  service = new CreateSampleService(new InMemorySamplesRepository());
});

describe("CreateSampleService", () => {
  it("should creates a sample", async () => {
    const result = await service.execute({ code: "BLOOD-001", specimenType: "blood" });
    expect(result.id).toBeTruthy();
    expect(result.code).toBe("BLOOD-001");
    expect(result.specimenType).toBe("blood");
  });
});
