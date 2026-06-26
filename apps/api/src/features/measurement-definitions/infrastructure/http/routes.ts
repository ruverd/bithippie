import { Elysia } from "elysia";
import type { MeasurementDefinitionsRepository } from "../../domain/measurement-definitions.repository";
import { getMeasurementDefinitions } from "../../application/get-measurement-definitions";
import { measurementDefinitionListSchema } from "../../application/schemas";

export function measurementDefinitionsRouter(repo: MeasurementDefinitionsRepository) {
  return new Elysia({ prefix: "/measurement-definitions" })
    .get("/", () => getMeasurementDefinitions(repo), {
      detail: { tags: ["MeasurementDefinitions"] },
      response: measurementDefinitionListSchema,
    });
}
