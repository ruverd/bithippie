import { Elysia, t } from "elysia";
import type { ProjectsRepository } from "../../domain/projects.repository";
import { getProjects } from "../../application/get-projects";
import { getProject } from "../../application/get-project";
import { getProjectResearchers } from "../../application/get-project-researchers";
import { getProjectExperiments } from "../../application/get-project-experiments";
import {
  projectListSchema,
  projectSchema,
  researcherMembershipListSchema,
  projectExperimentListSchema,
} from "../../application/schemas";

export function projectsRouter(repo: ProjectsRepository) {
  return new Elysia({ prefix: "/projects" })
    .get("/", () => getProjects(repo), {
      detail: { tags: ["Projects"] },
      response: projectListSchema,
    })
    .get("/:projectId", ({ params }) => getProject(repo, params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: projectSchema,
    })
    .get("/:projectId/researchers", ({ params }) => getProjectResearchers(repo, params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: researcherMembershipListSchema,
    })
    .get("/:projectId/experiments", ({ params }) => getProjectExperiments(repo, params.projectId), {
      params: t.Object({ projectId: t.String() }),
      detail: { tags: ["Projects"] },
      response: projectExperimentListSchema,
    });
}
