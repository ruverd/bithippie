import { Elysia, t } from "elysia";
import type { SamplesServices } from "../../application/services";
import { createSampleSchema, sampleListSchema, sampleSchema } from "../../application/schemas";
import { SamplesController } from "./samples.controller";

export function samplesRouter(services: SamplesServices) {
  const controller = new SamplesController(services);
  return new Elysia({ prefix: "/samples" })
    .get("/", () => controller.getSamples(), {
      detail: { tags: ["Samples"] },
      response: sampleListSchema,
    })
    .post("/", ({ body, set }) => controller.createSample(body, set), {
      body: createSampleSchema,
      response: { 201: sampleSchema },
      detail: { tags: ["Samples"], summary: "Register a sample" },
    })
    .get("/:sampleId", ({ params }) => controller.getSample(params.sampleId), {
      params: t.Object({ sampleId: t.String() }),
      detail: { tags: ["Samples"] },
      response: sampleSchema,
    });
}
