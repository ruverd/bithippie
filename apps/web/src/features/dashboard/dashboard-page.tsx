import { Plus, FolderKanban, FlaskConical, TestTube, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "./stat-card";
import { MeasurementsBarChart, MEASUREMENTS_PLACEHOLDER } from "./measurements-bar-chart";
import { ExperimentsStatusDonut, EXPERIMENTS_STATUS_PLACEHOLDER } from "./experiments-status-donut";
import { RecentMeasurementsTable, RECENT_MEASUREMENTS_PLACEHOLDER } from "./recent-measurements-table";
import { ActiveExperimentsList, ACTIVE_EXPERIMENTS_PLACEHOLDER } from "./active-experiments-list";

const STAT_CARDS = [
  { label: "Active Projects", icon: FolderKanban, value: "8", delta: "+2 this quarter" },
  { label: "Running Experiments", icon: FlaskConical, value: "18", delta: "+5 this week" },
  { label: "Samples Logged", icon: TestTube, value: "1,204", delta: "+86 today" },
  { label: "Measurements", icon: Activity, value: "8,640", delta: "+312 this week" },
] as const;

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Lab activity overview · Friday, June 26, 2026
          </p>
        </div>
        <Button>
          <Plus size={16} />
          New Experiment
        </Button>
      </div>

      <div className="flex gap-5">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            icon={card.icon}
            value={card.value}
            delta={card.delta}
          />
        ))}
      </div>

      <div className="flex h-80 gap-5">
        <MeasurementsBarChart data={MEASUREMENTS_PLACEHOLDER} />
        <ExperimentsStatusDonut
          data={EXPERIMENTS_STATUS_PLACEHOLDER}
          total={18}
        />
      </div>

      <div className="flex min-h-0 flex-1 gap-5">
        <RecentMeasurementsTable rows={RECENT_MEASUREMENTS_PLACEHOLDER} />
        <ActiveExperimentsList experiments={ACTIVE_EXPERIMENTS_PLACEHOLDER} />
      </div>
    </div>
  );
}
