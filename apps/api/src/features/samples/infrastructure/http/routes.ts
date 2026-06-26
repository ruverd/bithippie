import { Elysia, t } from "elysia";
import type { SamplesRepository } from "../../domain/samples.repository";
import { getSamples } from "../../application/get-samples";
import { getSample } from "../../application/get-sample";
import { sampleListSchema, sampleSchema } from "../../application/schemas";

export function samplesRouter(repo: SamplesRepository) {
  return new Elysia({ prefix: "/samples" })
    .get("/", () => getSamples(repo), {
      detail: { tags: ["Samples"] },
      response: sampleListSchema,
    })
    .get("/:sampleId", ({ params }) => getSample(repo, params.sampleId), {
      params: t.Object({ sampleId: t.String() }),
      detail: { tags: ["Samples"] },
      response: sampleSchema,
    });
}
