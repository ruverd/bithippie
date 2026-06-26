import { Elysia } from "elysia";
import openapi from "@elysiajs/openapi";
import type { Container } from "./container";
import { errorHandler } from "./infrastructure/http/error-handler";
import { projectsRouter } from "./features/projects/infrastructure/http/routes";

export function buildApp(container: Container): Elysia {
  return new Elysia()
    .use(errorHandler)
    .use(openapi({ path: "/openapi" }))
    .get("/health", () => ({ status: "ok" }), {
      detail: { summary: "Health check", tags: ["Health"] },
    })
    .use(projectsRouter(container.projects));
}
