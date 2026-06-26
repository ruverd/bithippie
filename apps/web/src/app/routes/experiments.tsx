import { useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useGetExperiments } from "@/generated/hooks/experimentsController/useGetExperiments";
import type { GetExperiments200 } from "@/generated/types/experimentsController/GetExperiments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { DataTable } from "@/components/data-table";

type Experiment = GetExperiments200[number];

type StatusFilter = "all" | "ACTIVE" | "PLANNING" | "COMPLETED" | "CANCELLED";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const columns: ColumnDef<Experiment>[] = [
  {
    id: "name",
    accessorKey: "title",
    header: "Name",
    cell: ({ row }) => (
      <>
        <Link
          to={`/experiments/${row.original.id}`}
          className="text-sm font-semibold hover:underline"
        >
          {row.original.title}
        </Link>
        {row.original.hypothesis && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {row.original.hypothesis}
          </p>
        )}
      </>
    ),
  },
  {
    id: "project",
    accessorKey: "projectName",
    header: "Project",
    meta: { headClassName: "w-[200px]", cellClassName: "text-sm" },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    meta: { headClassName: "w-[130px]" },
    cell: ({ row }) =>
      row.original.status ? (
        <StatusBadge status={row.original.status} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "lead",
    accessorFn: (e) => e.leadName ?? "",
    header: "Lead",
    meta: { headClassName: "w-[160px]", cellClassName: "text-[13px]" },
    cell: ({ row }) =>
      row.original.leadName ?? <span className="text-muted-foreground">—</span>,
  },
  {
    id: "measurements",
    accessorKey: "measurementCount",
    header: "Measurements",
    meta: { headClassName: "w-[120px]", cellClassName: "text-sm" },
  },
  {
    id: "started",
    accessorKey: "startDate",
    header: "Started",
    meta: { headClassName: "w-[120px]", cellClassName: "text-[13px] text-muted-foreground" },
    cell: ({ row }) => formatDate(row.original.startDate),
  },
];

export function ExperimentsPage() {
  const { data, isLoading, isError } = useGetExperiments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allExperiments = data ?? [];

  const filtered = allExperiments.filter((e) => {
    const term = search.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(term) ||
      e.projectName.toLowerCase().includes(term) ||
      (e.leadName?.toLowerCase().includes(term) ?? false) ||
      (e.hypothesis?.toLowerCase().includes(term) ?? false);
    const matchesStatus =
      statusFilter === "all" || (e.status?.toUpperCase() ?? "") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Experiments</h1>
          <p className="text-sm text-muted-foreground">
            Assays and trials tracked across projects
          </p>
        </div>
        <Button>
          <Plus size={16} />
          New Experiment
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-8"
            placeholder="Search experiments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter === "all" ? undefined : statusFilter}
          onValueChange={(v) => setStatusFilter((v ?? "all") as StatusFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PLANNING">Planning</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        noun="experiments"
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
