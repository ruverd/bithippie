import { Elysia, t } from "elysia";
import type { ProjectsServices } from "../../application/services";
import {
  createProjectSchema,
  projectDetailSchema,
  projectExperimentListSchema,
  projectListSchema,
  projectMeasurementListSchema,
  projectSampleListSchema,
  researcherMembershipListSchema,
  updateProjectSchema,
} from "../../application/schemas";
import { ProjectsController } from "./projects.controller";

export function projectsRouter(services: ProjectsServices) {
  const controller = new ProjectsController(services);
  return new Elysia({ prefix: "/projects" })
    .get("/", () => controller.getProjects(), {
      detail: { tags: ["Projects"] },
      response: projectListSchema,
    })
    .post(
      "/",
      ({ body, set }) => controller.createProject(body, set),
      {
        body: createProjectSchema,
        response: { 201: projectDetailSchema },
        detail: { tags: ["Projects"], summary: "Create a project" },
      },
    )
    .get("/:projectId", ({ params }) => controller.getProject(params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: projectDetailSchema,
    })
    .patch(
      "/:projectId",
      ({ params, body }) => controller.updateProject(params.projectId, body),
      {
        params: t.Object({ projectId: t.String() }),
        body: updateProjectSchema,
        response: projectDetailSchema,
        detail: { tags: ["Projects"], summary: "Update a project" },
      },
    )
    .get("/:projectId/researchers", ({ params }) => controller.getProjectResearchers(params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: researcherMembershipListSchema,
    })
    .get("/:projectId/experiments", ({ params }) => controller.getProjectExperiments(params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: projectExperimentListSchema,
    })
    .get("/:projectId/samples", ({ params }) => controller.getProjectSamples(params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: projectSampleListSchema,
    })
    .get("/:projectId/measurements", ({ params }) => controller.getProjectMeasurements(params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: projectMeasurementListSchema,
    });
}
