import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SimpleTable({
  head,
  empty,
  emptyLabel,
  children,
}: {
  head: string[];
  empty: boolean;
  emptyLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border bg-card">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            {head.map((h) => (
              <TableHead
                key={h}
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {empty ? (
            <TableRow>
              <TableCell
                colSpan={head.length}
                className="py-10 text-center text-sm text-muted-foreground"
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
}
