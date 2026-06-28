import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySamplesRepository } from "../../repositories/memory";
import { buildSamplesServices } from "../../../application/services";
import { SamplesController } from "../samples.controller";

let controller: SamplesController;

beforeEach(() => {
  controller = new SamplesController(
    buildSamplesServices(
      new InMemorySamplesRepository([
        {
          id: "s1",
          code: "SAMP-1",
          specimenType: "blood",
          collectedAt: null,
          storageLocation: null,
          experimentCount: 0,
        },
      ]),
    ),
  );
});

describe("SamplesController", () => {
  it("should getSamples forwards to the service", async () => {
    const result = await controller.getSamples();
    expect(result).toHaveLength(1);
    expect(result[0]?.code).toBe("SAMP-1");
  });

  it("should getSample forwards to the service", async () => {
    const result = await controller.getSample("s1");
    expect(result.code).toBe("SAMP-1");
  });

  it("should createSample forwards to the service and sets status 201", async () => {
    const set: { status?: number | string } = {};
    const result = await controller.createSample(
      { code: "SAMP-2", specimenType: "tissue" },
      set,
    );
    expect(set.status).toBe(201);
    expect(result.code).toBe("SAMP-2");
  });

  it("should updateSample forwards to the service", async () => {
    const result = await controller.updateSample("s1", { specimenType: "serum" });
    expect(result.specimenType).toBe("serum");
  });

  it("should deleteSample forwards to the service and sets status 204", async () => {
    const set: { status?: number | string } = {};
    await controller.deleteSample("s1", set);
    expect(set.status).toBe(204);
    await expect(controller.getSample("s1")).rejects.toBeTruthy();
  });
});
