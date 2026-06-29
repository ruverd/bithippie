import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

interface ActiveExperiment {
  id: string;
  name: string;
  project: string;
  measurementCount: number;
}

interface ActiveExperimentsListProps {
  experiments: ActiveExperiment[];
}

export function ActiveExperimentsList({ experiments }: ActiveExperimentsListProps) {
  return (
    <Card className="flex w-[380px] shrink-0 flex-col overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <p className="text-base font-semibold">Active Experiments</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 p-2">
        {experiments.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            No active experiments.
          </p>
        ) : (
          experiments.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-col gap-1.5 rounded-lg px-2 py-2.5 hover:bg-muted/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{exp.name}</span>
                <StatusBadge status="Active" />
              </div>
              <p className="text-xs text-muted-foreground">{exp.project}</p>
              <p className="text-xs text-muted-foreground">
                {exp.measurementCount} measurements
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
