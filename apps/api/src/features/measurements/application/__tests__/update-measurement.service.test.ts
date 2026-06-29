import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryMeasurementsRepository } from "../../infrastructure/repositories/memory";
import { UpdateMeasurementService } from "../update-measurement.service";
import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";

let service: UpdateMeasurementService;

beforeEach(() => {
  service = new UpdateMeasurementService(
    new InMemoryMeasurementsRepository({
      experiments: ["exp1"],
      samples: { exp1: ["s1"] },
      researchers: ["r1"],
      definitions: {
        def1: { id: "def1", valueType: "NUMERIC", allowedCategories: [] },
      },
      list: [
        {
          id: "m1",
          experimentId: "exp1",
          experimentName: "Exp",
          measurementDefinitionId: "def1",
          definitionName: "Lead",
          valueType: "NUMERIC",
          numericValue: 1,
          unit: "mg/L",
          categoricalValue: null,
          textValue: null,
          notes: null,
          recordedAt: "2026-01-01T00:00:00.000Z",
          recordedById: null,
          recordedByName: null,
        },
      ],
    }),
  );
});

describe("UpdateMeasurementService", () => {
  it("should update the numeric value", async () => {
    const result = await service.execute("m1", { numericValue: 9.5, unit: "mg/L" });
    expect(result.numericValue).toBe(9.5);
  });

  it("should throw NotFoundError when the measurement does not exist", async () => {
    await expect(service.execute("nope", { numericValue: 1 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should reject a value that does not match the definition type", async () => {
    await expect(service.execute("m1", { textValue: "x" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("should reject a sample not used by the experiment", async () => {
    await expect(
      service.execute("m1", { numericValue: 2, sampleIds: ["stray"] }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
