import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useGetResearchers } from "@/generated/hooks/researchers/useGetResearchers";
import type { GetResearchers200 } from "@/generated/types/researchers/GetResearchers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { ResearcherFormDialog } from "@/features/researchers/components/researcher-form-dialog";
import { initials } from "@/utils/initials";
import { formatRole } from "@/utils/format-role";

type Researcher = GetResearchers200[number];

const ROLES = [
  "PRINCIPAL_INVESTIGATOR",
  "POSTDOC",
  "GRADUATE_STUDENT",
  "LAB_TECHNICIAN",
] as const;

const columns: ColumnDef<Researcher>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8 bg-muted">
          <AvatarFallback className="bg-muted text-xs font-semibold">
            {initials(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-semibold">{row.original.name}</span>
      </div>
    ),
  },
  {
    id: "role",
    accessorKey: "globalRole",
    header: "Role",
    meta: { headClassName: "w-[180px]", cellClassName: "text-[13px]" },
    cell: ({ row }) => formatRole(row.original.globalRole),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    meta: { headClassName: "w-[250px]", cellClassName: "text-[13px] text-muted-foreground" },
  },
  {
    id: "projects",
    accessorKey: "projectCount",
    header: "Projects",
    meta: { headClassName: "w-[100px]", cellClassName: "text-sm" },
  },
  {
    id: "measurements",
    accessorKey: "measurementCount",
    header: "Measurements",
    meta: { headClassName: "w-[130px]", cellClassName: "text-sm" },
  },
];

export function ResearchersPage() {
  const { data, isLoading, isError } = useGetResearchers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; researcher: Researcher } | null
  >(null);

  const allResearchers = data ?? [];

  const filtered = allResearchers.filter((r) => {
    const term = search.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      formatRole(r.globalRole).toLowerCase().includes(term);
    const matchesRole = roleFilter === "all" || r.globalRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Researchers</h1>
          <p className="text-sm text-muted-foreground">
            Lab members and their activity
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus size={16} />
          New Researcher
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
            placeholder="Search researchers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          items={Object.fromEntries(ROLES.map((r) => [r, formatRole(r)]))}
          value={roleFilter === "all" ? undefined : roleFilter}
          onValueChange={(v) => setRoleFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {formatRole(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        noun="researchers"
        isLoading={isLoading}
        isError={isError}
        cellClassName="py-3 px-4"
        onRowClick={(r) => setDialog({ mode: "edit", researcher: r })}
      />

      <ResearcherFormDialog
        open={dialog !== null}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
        researcher={dialog?.mode === "edit" ? dialog.researcher : null}
      />
    </div>
  );
}
