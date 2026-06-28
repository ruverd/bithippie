import { FolderKanban, FlaskConical, TestTube, Activity, type LucideIcon } from "lucide-react";
import { StatCard } from "./stat-card";
import { MeasurementsBarChart } from "./measurements-bar-chart";
import { ExperimentsStatusDonut } from "./experiments-status-donut";
import { RecentMeasurementsTable } from "./recent-measurements-table";
import { ActiveExperimentsList } from "./active-experiments-list";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { useGetExperiments } from "@/generated/hooks/experiments/useGetExperiments";
import { useGetSamples } from "@/generated/hooks/samples/useGetSamples";
import { useGetMeasurements } from "@/generated/hooks/measurements/useGetMeasurements";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";
import {
  statCards,
  measurementsByMonth,
  experimentsByStatus,
  recentMeasurements,
  activeExperiments,
} from "./aggregate";

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

interface DashboardContentProps {
  projects: GetProjects200;
  experiments: GetExperiments200;
  samples: GetSamples200;
  measurements: GetMeasurements200;
  now: Date;
}

function DashboardContent({
  projects,
  experiments,
  samples,
  measurements,
  now,
}: DashboardContentProps) {
  const stats = statCards(projects, experiments, samples, measurements);
  const status = experimentsByStatus(experiments);

  const cards: { label: string; icon: LucideIcon; value: number }[] = [
    { label: "Active Projects", icon: FolderKanban, value: stats.activeProjects },
    { label: "Running Experiments", icon: FlaskConical, value: stats.runningExperiments },
    { label: "Samples Logged", icon: TestTube, value: stats.samplesLogged },
    { label: "Measurements", icon: Activity, value: stats.measurements },
  ];

  return (
    <>
      <div className="flex gap-5">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            icon={card.icon}
            value={card.value.toLocaleString()}
          />
        ))}
      </div>

      <div className="flex h-80 gap-5">
        <MeasurementsBarChart data={measurementsByMonth(measurements, now)} />
        <ExperimentsStatusDonut data={status.items} total={status.total} />
      </div>

      <div className="flex min-h-0 flex-1 gap-5">
        <RecentMeasurementsTable rows={recentMeasurements(measurements)} />
        <ActiveExperimentsList experiments={activeExperiments(experiments)} />
      </div>
    </>
  );
}
