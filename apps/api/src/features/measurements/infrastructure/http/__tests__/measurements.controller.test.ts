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

  it("should deleteMeasurement forwards to the service and sets status 204", async () => {
    const controllerWithRow = new MeasurementsController(
      buildMeasurementsServices(
        new InMemoryMeasurementsRepository({
          experiments: ["e1"],
          samples: {},
          researchers: [],
          definitions: {},
          list: [
            {
              id: "m1",
              experimentId: "e1",
              experimentName: "Exp",
              measurementDefinitionId: "numeric",
              definitionName: "Lead",
              valueType: "NUMERIC",
              numericValue: 1,
              unit: null,
              categoricalValue: null,
              textValue: null,
              notes: null,
              recordedAt: "2026-01-01T00:00:00.000Z",
              recordedById: null,
              recordedByName: null,
            },
          ],
        }),
      ),
    );
    const set: { status?: number | string } = {};
    await controllerWithRow.deleteMeasurement("m1", set);
    expect(set.status).toBe(204);
  });
});
