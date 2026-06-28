import type { Project, ProjectListItem } from "../domain/project";
type PrismaProject = { id: string; title: string; description: string | null; status: string | null };
export const toProject = (row: PrismaProject): Project => ({
  id: row.id, title: row.title, description: row.description, status: row.status,
});
type PrismaProjectListRow = PrismaProject & {
  updatedAt: Date;
  _count: { experiments: number };
  researchers: { projectRole: string; researcher: { name: string } }[];
};
export const toProjectListItem = (row: PrismaProjectListRow): ProjectListItem => ({
  ...toProject(row),
  experimentCount: row._count.experiments,
  updatedAt: row.updatedAt.toISOString(),
  team: [...row.researchers]
    .sort((a, b) => (a.projectRole === "LEAD" ? -1 : b.projectRole === "LEAD" ? 1 : 0))
    .map((m) => ({ name: m.researcher.name, projectRole: m.projectRole })),
});
