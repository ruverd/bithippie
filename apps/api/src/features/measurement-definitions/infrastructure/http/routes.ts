import { Elysia } from "elysia";
import type { MeasurementDefinitionsServices } from "../../application/services";
import { measurementDefinitionListSchema } from "../../application/schemas";
import { MeasurementDefinitionsController } from "./measurement-definitions.controller";

export function measurementDefinitionsRouter(services: MeasurementDefinitionsServices) {
  const controller = new MeasurementDefinitionsController(services);
  return new Elysia({ prefix: "/measurement-definitions" })
    .get("/", () => controller.getMeasurementDefinitions(), {
      detail: { tags: ["MeasurementDefinitions"] },
      response: measurementDefinitionListSchema,
    });
}
