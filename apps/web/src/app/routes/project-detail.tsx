import { useParams } from "react-router-dom";
import { useGetProjectsByProjectId } from "@/generated/hooks/projectsController/useGetProjectsByProjectId";
import { useGetProjectsByProjectIdResearchers } from "@/generated/hooks/projectsController/useGetProjectsByProjectIdResearchers";
import { useGetProjectsByProjectIdExperiments } from "@/generated/hooks/projectsController/useGetProjectsByProjectIdExperiments";

export function ProjectDetailPage() {
  const { projectId = "" } = useParams();
  const project = useGetProjectsByProjectId(projectId);
  const researchers = useGetProjectsByProjectIdResearchers(projectId);
  const experiments = useGetProjectsByProjectIdExperiments(projectId);
  if (project.isLoading) return <p>Loading…</p>;
  if (project.isError) return <p role="alert">Failed to load project.</p>;
  return (
    <div className="flex flex-col gap-4 text-xs">
      <pre>{JSON.stringify(project.data, null, 2)}</pre>
      <pre>{JSON.stringify(researchers.data ?? [], null, 2)}</pre>
      <pre>{JSON.stringify(experiments.data ?? [], null, 2)}</pre>
    </div>
  );
}
