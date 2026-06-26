import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

interface ActiveExperiment {
  name: string;
  project: string;
  progress: number;
}

interface ActiveExperimentsListProps {
  experiments: ActiveExperiment[];
}

// TODO: bind to API
export const ACTIVE_EXPERIMENTS_PLACEHOLDER: ActiveExperiment[] = [
  { name: "Baseline Cas9 fidelity", project: "CRISPR Off-Target", progress: 72 },
  { name: "GUIDE-seq validation", project: "CRISPR Off-Target", progress: 45 },
  { name: "Gut flora 16S run", project: "Microbiome Response", progress: 88 },
  { name: "Organoid imaging D30", project: "Neural Organoid", progress: 30 },
  { name: "Carbon flux assay", project: "Soil Carbon", progress: 61 },
];

export function ActiveExperimentsList({ experiments }: ActiveExperimentsListProps) {
  return (
    <Card className="flex w-[380px] shrink-0 flex-col overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <p className="text-base font-semibold">Active Experiments</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 p-2">
        {experiments.map((exp) => (
          <div
            key={exp.name}
            className="flex flex-col gap-1.5 rounded-lg px-2 py-2.5 hover:bg-muted/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{exp.name}</span>
              <StatusBadge status="Active" />
            </div>
            <p className="text-xs text-muted-foreground">{exp.project}</p>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary"
                style={{ width: `${exp.progress}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
