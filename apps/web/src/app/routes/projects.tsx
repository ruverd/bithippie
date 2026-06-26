import { useState } from "react";
import { Link } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useGetProjects } from "@/generated/hooks/projectsController/useGetProjects";
import type { GetProjects200 } from "@/generated/types/projectsController/GetProjects";
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
import { TeamAvatars } from "@/features/projects/team-avatars";
import { DataTable } from "@/components/data-table";

// TODO: team / experiment count / updated date are not in the projects list endpoint — placeholders

type Project = GetProjects200[number];

type StatusFilter = "all" | "ACTIVE" | "PLANNING" | "COMPLETED" | "CANCELLED";

const columns: ColumnDef<Project>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Project Title",
    cell: ({ row }) => (
      <>
        <Link
          to={`/projects/${row.original.id}`}
          className="text-sm font-semibold hover:underline"
        >
          {row.original.title}
        </Link>
        {row.original.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {row.original.description}
          </p>
        )}
      </>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    meta: { headClassName: "w-[140px]" },
    cell: ({ row }) =>
      row.original.status ? (
        <StatusBadge status={row.original.status} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "team",
    header: "Team",
    enableSorting: false,
    meta: { headClassName: "w-[120px]" },
    cell: ({ row }) => <TeamAvatars title={row.original.title} />,
  },
  {
    id: "experiments",
    header: "Experiments",
    enableSorting: false,
    meta: { headClassName: "w-[120px]", cellClassName: "text-sm text-muted-foreground" },
    cell: () => "—",
  },
  {
    id: "updated",
    header: "Updated",
    enableSorting: false,
    meta: { headClassName: "w-[120px]", cellClassName: "text-sm text-muted-foreground" },
    cell: () => "—",
  },
];

export function ProjectsPage() {
  const { data, isLoading, isError } = useGetProjects();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allProjects = data ?? [];

  const filtered = allProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus =
      statusFilter === "all" || (p.status?.toUpperCase() ?? "") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage research projects and their experiments
          </p>
        </div>
        <Button>
          <Plus size={16} />
          New Project
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
            placeholder="Search projects..."
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
        noun="projects"
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
