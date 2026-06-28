import { describe, expect, it } from "vitest";
import { ListMeasurementsService } from "../list-measurements.service";
import { InMemoryMeasurementsRepository } from "../../infrastructure/repositories/memory";
import type { MeasurementListItem } from "../../domain/measurement";

const row: MeasurementListItem = {
  id: "m1",
  experimentId: "e1",
  experimentName: "Baseline lead screening",
  measurementDefinitionId: "d1",
  definitionName: "Lead concentration",
  valueType: "NUMERIC",
  numericValue: 12.4,
  unit: "mg/L",
  categoricalValue: null,
  textValue: null,
  notes: null,
  recordedAt: new Date(0).toISOString(),
  recordedById: "r1",
  recordedByName: "Alice Nguyen",
};

const service = new ListMeasurementsService(
  new InMemoryMeasurementsRepository({
    experiments: [],
    samples: {},
    researchers: [],
    definitions: {},
    list: [row],
  }),
);

describe("ListMeasurementsService", () => {
  it("should returns the enriched measurement rows", async () => {
    const result = await service.execute();
    expect(result).toEqual([row]);
  });

  it("should returns an empty array when none exist", async () => {
    const empty = new ListMeasurementsService(
      new InMemoryMeasurementsRepository({
        experiments: [],
        samples: {},
        researchers: [],
        definitions: {},
      }),
    );
    expect(await empty.execute()).toEqual([]);
  });
});
