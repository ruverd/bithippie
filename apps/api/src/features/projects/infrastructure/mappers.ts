import type { Project, ProjectListItem } from "../domain/project";
type PrismaProject = { id: string; title: string; description: string | null; status: string | null };
export const toProject = (row: PrismaProject): Project => ({
  id: row.id, title: row.title, description: row.description, status: row.status,
});
type PrismaProjectListRow = PrismaProject & { updatedAt: Date; _count: { experiments: number } };
export const toProjectListItem = (row: PrismaProjectListRow): ProjectListItem => ({
  ...toProject(row),
  experimentCount: row._count.experiments,
  updatedAt: row.updatedAt.toISOString(),
});
