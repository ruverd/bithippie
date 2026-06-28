import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryMeasurementDefinitionsRepository } from "../../repositories/memory";
import { buildMeasurementDefinitionsServices } from "../../../application/services";
import { MeasurementDefinitionsController } from "../measurement-definitions.controller";

let controller: MeasurementDefinitionsController;

beforeEach(() => {
  controller = new MeasurementDefinitionsController(
    buildMeasurementDefinitionsServices(
      new InMemoryMeasurementDefinitionsRepository([
        {
          id: "d1",
          name: "Lead Concentration",
          valueType: "NUMERIC",
          defaultUnit: "mg/L",
          allowedCategories: [],
          description: null,
        },
      ]),
    ),
  );
});

describe("MeasurementDefinitionsController", () => {
  it("should getMeasurementDefinitions forwards to the service", async () => {
    const result = await controller.getMeasurementDefinitions();
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Lead Concentration");
  });
});
