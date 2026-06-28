import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryMeasurementsRepository } from "../../repositories/memory";
import { buildMeasurementsServices } from "../../../application/services";
import { MeasurementsController } from "../measurements.controller";

let controller: MeasurementsController;

beforeEach(() => {
  controller = new MeasurementsController(
    buildMeasurementsServices(
      new InMemoryMeasurementsRepository({
        experiments: ["e1"],
        samples: { e1: ["s1", "s2"] },
        researchers: ["r1"],
        definitions: {
          numeric: { id: "numeric", valueType: "NUMERIC", allowedCategories: [] },
        },
        list: [],
      }),
    ),
  );
});

describe("MeasurementsController", () => {
  it("should listMeasurements forwards to the service", async () => {
    const result = await controller.listMeasurements();
    expect(result).toEqual([]);
  });

  it("should createMeasurement forwards to the service and sets status 201", async () => {
    const set: { status?: number | string } = {};
    const result = await controller.createMeasurement(
      "e1",
      { measurementDefinitionId: "numeric", numericValue: 12.4, unit: "mg/L" },
      set,
    );
    expect(set.status).toBe(201);
    expect(result.numericValue).toBe(12.4);
    expect(result.experimentId).toBe("e1");
  });
});
