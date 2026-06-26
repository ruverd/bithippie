import { Elysia, t } from "elysia";
import type { ExperimentsRepository } from "../../domain/experiments.repository";
import { getExperiment } from "../../application/get-experiment";
import { getExperimentMeasurements } from "../../application/get-experiment-measurements";
import { getExperimentSamples } from "../../application/get-experiment-samples";

export function experimentsRouter(repo: ExperimentsRepository) {
  return new Elysia({ prefix: "/experiments" })
    .get("/:experimentId", ({ params }) => getExperiment(repo, params.experimentId), {
      params: t.Object({ experimentId: t.String() }),
      detail: { tags: ["Experiments"] },
    })
    .get("/:experimentId/measurements", ({ params }) => getExperimentMeasurements(repo, params.experimentId), {
      params: t.Object({ experimentId: t.String() }),
      detail: { tags: ["Experiments"] },
    })
    .get("/:experimentId/samples", ({ params }) => getExperimentSamples(repo, params.experimentId), {
      params: t.Object({ experimentId: t.String() }),
      detail: { tags: ["Experiments"] },
    });
}
