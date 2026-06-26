import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { getExperiment } from "../get-experiment";
import { getExperimentMeasurements } from "../get-experiment-measurements";
import { getExperimentSamples } from "../get-experiment-samples";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemoryExperimentsRepository;

beforeEach(() => {
  repo = new InMemoryExperimentsRepository(
    [
      {
        id: "e1",
        title: "Exp One",
        hypothesis: "Water is wet",
        status: "ACTIVE",
        projectId: "p1",
        previousExperimentId: null,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: null,
      },
    ],
    {
      e1: [
        {
          id: "m1",
          measurementDefinitionId: "def1",
          definitionName: "Lead",
          valueType: "NUMERIC",
          numericValue: 1.5,
          unit: "mg/L",
          categoricalValue: null,
          textValue: null,
          notes: null,
          recordedAt: "2024-01-02T00:00:00.000Z",
          recordedById: null,
        },
        {
          id: "m2",
          measurementDefinitionId: "def2",
          definitionName: "Screen",
          valueType: "CATEGORICAL",
          numericValue: null,
          unit: null,
          categoricalValue: "positive",
          textValue: null,
          notes: null,
          recordedAt: "2024-01-03T00:00:00.000Z",
          recordedById: null,
        },
      ],
    },
    {
      e1: [{ id: "s1", code: "BLOOD-001", specimenType: "blood", storageLocation: "-80C" }],
    },
  );
});

describe("experiments use cases", () => {
  it("gets an experiment by id", async () => {
    const result = await getExperiment(repo, "e1");
    expect(result.title).toBe("Exp One");
  });

  it("throws NotFoundError for a missing experiment", async () => {
    await expect(getExperiment(repo, "nope")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lists measurements for an experiment", async () => {
    const result = await getExperimentMeasurements(repo, "e1");
    expect(result).toHaveLength(2);
    expect(result[0].definitionName).toBe("Lead");
  });

  it("throws NotFoundError for measurements of unknown experiment", async () => {
    await expect(getExperimentMeasurements(repo, "nope")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lists samples for an experiment", async () => {
    const result = await getExperimentSamples(repo, "e1");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("BLOOD-001");
  });

  it("throws NotFoundError for samples of unknown experiment", async () => {
    await expect(getExperimentSamples(repo, "nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
