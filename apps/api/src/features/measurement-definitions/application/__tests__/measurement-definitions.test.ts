import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryMeasurementDefinitionsRepository } from "../../infrastructure/repositories/memory";
import { getMeasurementDefinitions } from "../get-measurement-definitions";

let repo: InMemoryMeasurementDefinitionsRepository;

beforeEach(() => {
  repo = new InMemoryMeasurementDefinitionsRepository([
    { id: "def1", name: "Lead", valueType: "NUMERIC", defaultUnit: "mg/L", allowedCategories: [], description: null },
    { id: "def2", name: "Screen", valueType: "CATEGORICAL", defaultUnit: null, allowedCategories: ["positive", "negative", "inconclusive"], description: "Screening result" },
    { id: "def3", name: "Temperature", valueType: "NUMERIC", defaultUnit: "°C", allowedCategories: [], description: null },
    { id: "def4", name: "Observations", valueType: "TEXT", defaultUnit: null, allowedCategories: [], description: null },
  ]);
});

describe("measurement-definitions use cases", () => {
  it("lists all measurement definitions", async () => {
    const result = await getMeasurementDefinitions(repo);
    expect(result).toHaveLength(4);
  });

  it("includes a definition with non-empty allowedCategories", async () => {
    const result = await getMeasurementDefinitions(repo);
    const withCategories = result.find((d) => d.allowedCategories.length > 0);
    expect(withCategories).toBeDefined();
    expect(withCategories?.allowedCategories).toContain("positive");
  });
});
