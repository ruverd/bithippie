import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExperimentsRepository } from "../../repositories/memory";
import { buildExperimentsServices } from "../../../application/services";
import { ExperimentsController } from "../experiments.controller";

let controller: ExperimentsController;

beforeEach(() => {
  controller = new ExperimentsController(
    buildExperimentsServices(
      new InMemoryExperimentsRepository(
        [
          {
            id: "e1",
            title: "Exp One",
            hypothesis: null,
            status: "ACTIVE",
            projectId: "p1",
            previousExperimentId: null,
            startDate: null,
            endDate: null,
          },
        ],
        {},
        {},
        [],
        ["p1"],
      ),
    ),
  );
});

describe("ExperimentsController", () => {
  it("should getExperiment forwards to the service", async () => {
    const result = await controller.getExperiment("e1");
    expect(result.title).toBe("Exp One");
  });

  it("should createExperiment forwards to the service and sets status 201", async () => {
    const set: { status?: number | string } = {};
    const result = await controller.createExperiment({ title: "New", projectId: "p1" }, set);
    expect(set.status).toBe(201);
    expect(result.title).toBe("New");
  });
});
