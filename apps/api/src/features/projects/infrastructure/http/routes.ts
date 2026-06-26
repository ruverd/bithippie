import { Elysia, t } from "elysia";
import type { ProjectsRepository } from "../../domain/projects.repository";
import { getProjects } from "../../application/get-projects";
import { getProject } from "../../application/get-project";
import { getProjectResearchers } from "../../application/get-project-researchers";
import { getProjectExperiments } from "../../application/get-project-experiments";

export function projectsRouter(repo: ProjectsRepository) {
  return new Elysia({ prefix: "/projects" })
    .get("/", () => getProjects(repo), { detail: { tags: ["Projects"] } })
    .get("/:projectId", ({ params }) => getProject(repo, params.projectId), {
      params: t.Object({ projectId: t.String() }), detail: { tags: ["Projects"] },
    })
    .get("/:projectId/researchers", ({ params }) => getProjectResearchers(repo, params.projectId), {
      params: t.Object({ projectId: t.String() }), detail: { tags: ["Projects"] },
    })
    .get("/:projectId/experiments", ({ params }) => getProjectExperiments(repo, params.projectId), {
      params: t.Object({ projectId: t.String() }), detail: { tags: ["Projects"] },
    });
}
