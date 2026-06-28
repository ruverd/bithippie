import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProjectsRepository } from "../../infrastructure/repositories/memory";
import { GetProjectMeasurementsService } from "../get-project-measurements.service";
import { NotFoundError } from "../../../../shared/domain/errors";

let service: GetProjectMeasurementsService;
beforeEach(() => {
  service = new GetProjectMeasurementsService(
    new InMemoryProjectsRepository(
      [{ id: "p1", title: "Water", description: null, status: "ACTIVE" }],
      {},
      {},
      [],
      {},
      {
        p1: [
          {
            id: "m1",
            definitionName: "Lead",
            valueType: "NUMERIC",
            numericValue: 1.5,
            unit: "ppm",
            categoricalValue: null,
            textValue: null,
            experimentId: "e1",
            experimentName: "Exp One",
            recordedAt: "2024-01-01T00:00:00.000Z",
            recordedById: null,
            recordedByName: null,
          },
        ],
      },
    ),
  );
});

describe("GetProjectMeasurementsService", () => {
  it("should returns measurements for an existing project", async () => {
    const result = await service.execute("p1");
    expect(result).toHaveLength(1);
    expect(result[0].definitionName).toBe("Lead");
  });
  it("should throws NotFoundError for an unknown project id", async () => {
    await expect(service.execute("nope")).rejects.toBeInstanceOf(NotFoundError);
  });
});
