import { Elysia, t } from "elysia";
import type { ExperimentsRepository } from "../../domain/experiments.repository";
import { getExperiment } from "../../application/get-experiment";
import { getExperimentMeasurements } from "../../application/get-experiment-measurements";
import { getExperimentSamples } from "../../application/get-experiment-samples";
import {
  experimentSchema,
  experimentMeasurementListSchema,
  experimentSampleListSchema,
} from "../../application/schemas";

export function experimentsRouter(repo: ExperimentsRepository) {
  return new Elysia({ prefix: "/experiments" })
    .get("/:experimentId", ({ params }) => getExperiment(repo, params.experimentId), {
      params: t.Object({ experimentId: t.String() }),
      detail: { tags: ["Experiments"] },
      response: experimentSchema,
    })
    .get("/:experimentId/measurements", ({ params }) => getExperimentMeasurements(repo, params.experimentId), {
      params: t.Object({ experimentId: t.String() }),
      detail: { tags: ["Experiments"] },
      response: experimentMeasurementListSchema,
    })
    .get("/:experimentId/samples", ({ params }) => getExperimentSamples(repo, params.experimentId), {
      params: t.Object({ experimentId: t.String() }),
      detail: { tags: ["Experiments"] },
      response: experimentSampleListSchema,
    });
}
