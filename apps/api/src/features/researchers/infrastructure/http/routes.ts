import { Elysia } from "elysia";
import type { ResearchersRepository } from "../../domain/researchers.repository";
import { getResearchers } from "../../application/get-researchers";
import { researcherListSchema } from "../../application/schemas";

export function researchersRouter(repo: ResearchersRepository) {
  return new Elysia({ prefix: "/researchers" }).get("/", () => getResearchers(repo), {
    detail: { tags: ["Researchers"], summary: "List all researchers" },
    response: researcherListSchema,
  });
}
