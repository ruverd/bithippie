import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useGetExperiments } from "@/generated/hooks/experiments/useGetExperiments";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import { STATUS_LABELS, type StatusFilter } from "@/constants/status";
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
import { ExperimentFormDialog } from "@/features/experiments/components/experiment-form-dialog";
import { formatDate } from "@/utils/format-date";

type Experiment = GetExperiments200[number];

const columns: ColumnDef<Experiment>[] = [
  {
    id: "name",
    accessorKey: "title",
    header: "Name",
    cell: ({ row }) => (
      <>
        <span className="text-sm font-semibold">{row.original.title}</span>
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
    accessorFn: (experiment) => experiment.leadName ?? "",
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
  const projects = useGetProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; experiment: Experiment } | null
  >(null);

  const allExperiments = data ?? [];
  const projectList = projects.data ?? [];

  const filtered = allExperiments.filter((experiment) => {
    const term = search.toLowerCase();
    const matchesSearch =
      experiment.title.toLowerCase().includes(term) ||
      experiment.projectName.toLowerCase().includes(term) ||
      (experiment.leadName?.toLowerCase().includes(term) ?? false) ||
      (experiment.hypothesis?.toLowerCase().includes(term) ?? false);
    const matchesStatus =
      statusFilter === "all" || (experiment.status?.toUpperCase() ?? "") === statusFilter;
    const matchesProject = projectFilter === "all" || experiment.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const hasFilters = search !== "" || statusFilter !== "all" || projectFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setProjectFilter("all");
  };

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Experiments</h1>
          <p className="text-sm text-muted-foreground">
            Assays and trials tracked across projects
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
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
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          items={Object.fromEntries(projectList.map((project) => [project.id, project.title]))}
          value={projectFilter === "all" ? undefined : projectFilter}
          onValueChange={(v) => setProjectFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projectList.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={STATUS_LABELS}
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
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        noun="experiments"
        isLoading={isLoading}
        isError={isError}
        onRowClick={(e) => setDialog({ mode: "edit", experiment: e })}
      />

      <ExperimentFormDialog
        open={dialog !== null}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
        experiment={dialog?.mode === "edit" ? dialog.experiment : null}
      />
    </div>
  );
}
