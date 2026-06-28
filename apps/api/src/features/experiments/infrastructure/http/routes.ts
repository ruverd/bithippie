import { Elysia, t } from "elysia";
import {
  createExperimentSchema,
  experimentListSchema,
  experimentMeasurementListSchema,
  experimentSampleListSchema,
  experimentSchema,
  updateExperimentSchema,
} from "../../application/schemas";
import type { ExperimentsServices } from "../../application/services";
import { ExperimentsController } from "./experiments.controller";

export function experimentsRouter(services: ExperimentsServices) {
  const controller = new ExperimentsController(services);
  return new Elysia({ prefix: "/experiments" })
    .get("/", () => controller.listExperiments(), {
      detail: { tags: ["Experiments"], summary: "List all experiments" },
      response: experimentListSchema,
    })
    .post("/", ({ body, set }) => controller.createExperiment(body, set), {
      body: createExperimentSchema,
      response: { 201: experimentSchema },
      detail: { tags: ["Experiments"], summary: "Create an experiment" },
    })
    .get(
      "/:experimentId",
      ({ params }) => controller.getExperiment(params.experimentId),
      {
        params: t.Object({ experimentId: t.String() }),
        detail: { tags: ["Experiments"] },
        response: experimentSchema,
      },
    )
    .patch(
      "/:experimentId",
      ({ params, body }) => controller.updateExperiment(params.experimentId, body),
      {
        params: t.Object({ experimentId: t.String() }),
        body: updateExperimentSchema,
        response: experimentSchema,
        detail: { tags: ["Experiments"], summary: "Update an experiment" },
      },
    )
    .delete(
      "/:experimentId",
      ({ params, set }) => controller.deleteExperiment(params.experimentId, set),
      {
        params: t.Object({ experimentId: t.String() }),
        detail: { tags: ["Experiments"], summary: "Delete an experiment" },
      },
    )
    .get(
      "/:experimentId/measurements",
      ({ params }) => controller.getExperimentMeasurements(params.experimentId),
      {
        params: t.Object({ experimentId: t.String() }),
        detail: { tags: ["Experiments"] },
        response: experimentMeasurementListSchema,
      },
    )
    .get(
      "/:experimentId/samples",
      ({ params }) => controller.getExperimentSamples(params.experimentId),
      {
        params: t.Object({ experimentId: t.String() }),
        detail: { tags: ["Experiments"] },
        response: experimentSampleListSchema,
      },
    );
}
