import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { useGetExperiments } from "@/generated/hooks/experiments/useGetExperiments";
import { useGetSamples } from "@/generated/hooks/samples/useGetSamples";
import { useGetMeasurements } from "@/generated/hooks/measurements/useGetMeasurements";

export function DashboardPage() {
  const projects = useGetProjects();
  const experiments = useGetExperiments();
  const samples = useGetSamples();
  const measurements = useGetMeasurements();

  const queries = [projects, experiments, samples, measurements];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const now = new Date();
  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold leading-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Lab activity overview · {today}</p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <p className="text-sm text-muted-foreground" role="alert">
          Failed to load dashboard data.
        </p>
      ) : (
        <DashboardContent
          projects={projects.data ?? []}
          experiments={experiments.data ?? []}
          samples={samples.data ?? []}
          measurements={measurements.data ?? []}
          now={now}
        />
      )}
    </div>
  );
}
