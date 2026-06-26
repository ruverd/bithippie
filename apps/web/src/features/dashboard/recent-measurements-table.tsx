import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MeasurementRow {
  definition: string;
  experiment: string;
  value: string;
  recordedBy: string;
  time: string;
}

interface RecentMeasurementsTableProps {
  rows: MeasurementRow[];
}

// TODO: bind to API
export const RECENT_MEASUREMENTS_PLACEHOLDER: MeasurementRow[] = [
  { definition: "Editing efficiency", experiment: "GUIDE-seq validation", value: "87.4 %", recordedBy: "SK", time: "2h ago" },
  { definition: "Off-target sites", experiment: "Baseline Cas9 fidelity", value: "3 sites", recordedBy: "DV", time: "4h ago" },
  { definition: "Cell viability", experiment: "Dose-response titration", value: "92.1 %", recordedBy: "PT", time: "Yesterday" },
  { definition: "Indel frequency", experiment: "Cell-line panel sweep", value: "0.42", recordedBy: "MO", time: "Yesterday" },
  { definition: "pH level", experiment: "Microbiome fasting cohort", value: "6.8", recordedBy: "JL", time: "2d ago" },
];

export function RecentMeasurementsTable({ rows }: RecentMeasurementsTableProps) {
  return (
    <Card className="flex flex-1 flex-col overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <p className="text-base font-semibold">Recent Measurements</p>
        <a href="#" className="text-[13px] font-medium text-primary">
          View all
        </a>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Definition</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Experiment</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Value</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recorded By</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.definition}-${row.time}`}>
                <TableCell className="text-sm font-medium">{row.definition}</TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{row.experiment}</TableCell>
                <TableCell className="text-sm font-semibold">{row.value}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 bg-muted">
                      <AvatarFallback className="bg-muted text-[10px] font-semibold">{row.recordedBy}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{row.recordedBy}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">{row.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
