import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../infrastructure/repositories/memory";
import { GetExperimentMeasurementsService } from "../get-experiment-measurements.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetExperimentMeasurementsService;

beforeEach(() => {
  service = new GetExperimentMeasurementsService(
    new InMemoryExperimentsRepository(
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
    ),
  );
});

describe("GetExperimentMeasurementsService", () => {
  it("should lists measurements for an experiment", async () => {
    const result = await service.execute("e1");
    expect(result).toHaveLength(2);
    expect(result[0].definitionName).toBe("Lead");
  });

  it("should throws NotFoundError for measurements of unknown experiment", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
