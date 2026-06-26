import { beforeEach, describe, expect, it } from "vitest";
import { createMeasurement } from "../create-measurement";
import { InMemoryMeasurementsRepository } from "../../infrastructure/repositories/memory";
import { NotFoundError, ValidationError } from "../../../../shared/domain/errors";

let repo: InMemoryMeasurementsRepository;
beforeEach(() => {
  repo = new InMemoryMeasurementsRepository({
    experiments: ["e1"],
    samples: { e1: ["s1", "s2"] },
    researchers: ["r1"],
    definitions: {
      numeric: { id: "numeric", valueType: "NUMERIC", allowedCategories: [] },
      screen: { id: "screen", valueType: "CATEGORICAL", allowedCategories: ["positive", "negative"] },
      note: { id: "note", valueType: "TEXT", allowedCategories: [] },
    },
  });
});

const base = { experimentId: "e1" };

describe("createMeasurement", () => {
  it("creates a valid numeric measurement", async () => {
    const m = await createMeasurement(repo, { ...base, measurementDefinitionId: "numeric", numericValue: 12.4, unit: "mg/L" });
    expect(m.numericValue).toBe(12.4);
  });
  it("rejects a numeric measurement without a numeric value", async () => {
    await expect(createMeasurement(repo, { ...base, measurementDefinitionId: "numeric", textValue: "x" }))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it("creates a valid categorical measurement", async () => {
    const m = await createMeasurement(repo, { ...base, measurementDefinitionId: "screen", categoricalValue: "positive" });
    expect(m.categoricalValue).toBe("positive");
  });
  it("rejects a categorical value outside the allowed list", async () => {
    await expect(createMeasurement(repo, { ...base, measurementDefinitionId: "screen", categoricalValue: "maybe" }))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it("creates a valid text measurement", async () => {
    const m = await createMeasurement(repo, { ...base, measurementDefinitionId: "note", textValue: "turbid" });
    expect(m.textValue).toBe("turbid");
  });
  it("throws NotFoundError for a missing experiment", async () => {
    await expect(createMeasurement(repo, { experimentId: "nope", measurementDefinitionId: "numeric", numericValue: 1 }))
      .rejects.toBeInstanceOf(NotFoundError);
  });
  it("rejects a sample not belonging to the experiment", async () => {
    await expect(createMeasurement(repo, { ...base, measurementDefinitionId: "numeric", numericValue: 1, sampleIds: ["sX"] }))
      .rejects.toBeInstanceOf(ValidationError);
  });
  it("links a valid sample", async () => {
    const m = await createMeasurement(repo, { ...base, measurementDefinitionId: "numeric", numericValue: 1, sampleIds: ["s1"] });
    expect(m.sampleIds).toEqual(["s1"]);
  });
});
