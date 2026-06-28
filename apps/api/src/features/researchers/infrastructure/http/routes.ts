import { Elysia, t } from "elysia";
import type { ResearchersServices } from "../../application/services";
import {
  createResearcherSchema,
  researcherListSchema,
  researcherSchema,
  updateResearcherSchema,
} from "../../application/schemas";
import { ResearchersController } from "./researchers.controller";

export function researchersRouter(services: ResearchersServices) {
  const controller = new ResearchersController(services);
  return new Elysia({ prefix: "/researchers" })
    .get("/", () => controller.getResearchers(), {
      detail: { tags: ["Researchers"], summary: "List all researchers" },
      response: researcherListSchema,
    })
    .post("/", ({ body, set }) => controller.createResearcher(body, set), {
      body: createResearcherSchema,
      response: { 201: researcherSchema },
      detail: { tags: ["Researchers"], summary: "Invite a researcher" },
    })
    .patch(
      "/:researcherId",
      ({ params, body }) => controller.updateResearcher(params.researcherId, body),
      {
        params: t.Object({ researcherId: t.String() }),
        body: updateResearcherSchema,
        response: researcherSchema,
        detail: { tags: ["Researchers"], summary: "Update a researcher" },
      },
    );
}
