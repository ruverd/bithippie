import { useGetProjects } from "@/generated/hooks/projectsController/useGetProjects";

export function ProjectsPage() {
  const { data, isLoading, isError } = useGetProjects();
  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p role="alert">Failed to load projects.</p>;
  if (!data || data.length === 0) return <p>No projects.</p>;
  return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
}
