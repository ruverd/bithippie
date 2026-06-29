import { FolderKanban, FlaskConical, TestTube, Activity, type LucideIcon } from "lucide-react";
import { StatCard } from "./stat-card";
import { MeasurementsBarChart } from "./measurements-bar-chart";
import { ExperimentsStatusDonut } from "./experiments-status-donut";
import { RecentMeasurementsTable } from "./recent-measurements-table";
import { ActiveExperimentsList } from "./active-experiments-list";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";
import { statCards } from "../utils/stat-cards";
import { measurementsByMonth } from "../utils/measurements-by-month";
import { experimentsByStatus } from "../utils/experiments-by-status";
import { recentMeasurements } from "../utils/recent-measurements";
import { activeExperiments } from "../utils/active-experiments";

export interface DashboardContentProps {
  projects: GetProjects200;
  experiments: GetExperiments200;
  samples: GetSamples200;
  measurements: GetMeasurements200;
  now: Date;
}

export function DashboardContent({
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
