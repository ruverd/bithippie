import { beforeEach, describe, expect, it } from "vitest";
import { CreateMeasurementService } from "../create-measurement.service";
import { InMemoryMeasurementsRepository } from "../../infrastructure/repositories/memory";
import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";

let service: CreateMeasurementService;
beforeEach(() => {
  service = new CreateMeasurementService(
    new InMemoryMeasurementsRepository({
      experiments: ["e1"],
      samples: { e1: ["s1", "s2"] },
      researchers: ["r1"],
      definitions: {
        numeric: { id: "numeric", valueType: "NUMERIC", allowedCategories: [] },
        screen: { id: "screen", valueType: "CATEGORICAL", allowedCategories: ["positive", "negative"] },
        note: { id: "note", valueType: "TEXT", allowedCategories: [] },
      },
    }),
  );
});

const base = { experimentId: "e1" };

describe("CreateMeasurementService", () => {
  it("should creates a valid numeric measurement", async () => {
    const m = await service.execute({ ...base, measurementDefinitionId: "numeric", numericValue: 12.4, unit: "mg/L" });
    expect(m.numericValue).toBe(12.4);
  });
  it("should rejects a numeric measurement without a numeric value", async () => {
    await expect(service.execute({ ...base, measurementDefinitionId: "numeric", textValue: "x" }))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it("should creates a valid categorical measurement", async () => {
    const m = await service.execute({ ...base, measurementDefinitionId: "screen", categoricalValue: "positive" });
    expect(m.categoricalValue).toBe("positive");
  });
  it("should rejects a categorical value outside the allowed list", async () => {
    await expect(service.execute({ ...base, measurementDefinitionId: "screen", categoricalValue: "maybe" }))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it("should creates a valid text measurement", async () => {
    const m = await service.execute({ ...base, measurementDefinitionId: "note", textValue: "turbid" });
    expect(m.textValue).toBe("turbid");
  });
  it("should throws NotFoundError for a missing experiment", async () => {
    await expect(service.execute({ experimentId: "nope", measurementDefinitionId: "numeric", numericValue: 1 }))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it("should rejects a sample not belonging to the experiment", async () => {
    await expect(service.execute({ ...base, measurementDefinitionId: "numeric", numericValue: 1, sampleIds: ["sX"] }))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it("should links a valid sample", async () => {
    const m = await service.execute({ ...base, measurementDefinitionId: "numeric", numericValue: 1, sampleIds: ["s1"] });
    expect(m.sampleIds).toEqual(["s1"]);
  });
});
