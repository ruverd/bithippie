import type { Project } from "../domain/project";
type PrismaProject = { id: string; title: string; description: string | null; status: string | null };
export const toProject = (row: PrismaProject): Project => ({
  id: row.id, title: row.title, description: row.description, status: row.status,
});
