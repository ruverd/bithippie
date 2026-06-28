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
import { Link } from "react-router-dom";

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

export function RecentMeasurementsTable({ rows }: RecentMeasurementsTableProps) {
  return (
    <Card className="flex flex-1 flex-col overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <p className="text-base font-semibold">Recent Measurements</p>
        <Link to="/measurements" className="text-[13px] font-medium text-primary">
          View all
        </Link>
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
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No measurements yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
