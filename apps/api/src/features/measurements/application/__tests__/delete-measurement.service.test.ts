import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryMeasurementsRepository } from "../../infrastructure/repositories/memory";
import { DeleteMeasurementService } from "../delete-measurement.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let repo: InMemoryMeasurementsRepository;
let service: DeleteMeasurementService;

beforeEach(() => {
  repo = new InMemoryMeasurementsRepository({
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
  });
  service = new DeleteMeasurementService(repo);
});

describe("DeleteMeasurementService", () => {
  it("should delete an existing measurement", async () => {
    await service.execute("m1");
    expect(await repo.findById("m1")).toBeNull();
  });

  it("should throw NotFoundError when the measurement does not exist", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
