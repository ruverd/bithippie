import { Elysia } from "elysia";
import openapi from "@elysiajs/openapi";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { Container } from "./container";
import { errorHandler } from "./infrastructure/http/error-handler";
import { projectsRouter } from "./features/projects/infrastructure/http/routes";
import { experimentsRouter } from "./features/experiments/infrastructure/http/routes";
import { samplesRouter } from "./features/samples/infrastructure/http/routes";
import { measurementDefinitionsRouter } from "./features/measurement-definitions/infrastructure/http/routes";
import { measurementsRouter } from "./features/measurements/infrastructure/http/routes";
import { researchersRouter } from "./features/researchers/infrastructure/http/routes";

export function buildApp(container: Container): Elysia {
  return new Elysia()
    .use(errorHandler)
    .use(openapi({ path: "/openapi", mapJsonSchema: { zod: zodToJsonSchema } }))
    .get("/health", () => ({ status: "ok" }), {
      detail: { summary: "Health check", tags: ["Health"] },
    })
    .use(projectsRouter(container.projects))
    .use(experimentsRouter(container.experiments))
    .use(samplesRouter(container.samples))
    .use(measurementDefinitionsRouter(container.measurementDefinitions))
    .use(measurementsRouter(container.measurements))
    .use(researchersRouter(container.researchers));
}
