import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useGetMeasurements } from "@/generated/hooks/measurements/useGetMeasurements";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { CreateMeasurementDialog } from "@/features/measurements/create-measurement-dialog";
import { EditMeasurementDialog } from "@/features/measurements/edit-measurement-dialog";
import { measurementValue } from "@/utils/measurement-value";
import { initials } from "@/utils/initials";
import { relativeTime } from "@/utils/relative-time";

type Measurement = GetMeasurements200[number];

const columns: ColumnDef<Measurement>[] = [
  {
    id: "definition",
    accessorKey: "definitionName",
    header: "Definition",
    cell: ({ row }) => (
      <>
        <p className="text-sm font-semibold">{row.original.definitionName}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {row.original.valueType}
        </p>
      </>
    ),
  },
  {
    id: "value",
    accessorFn: (m) => measurementValue(m),
    header: "Value",
    meta: { headClassName: "w-[130px]", cellClassName: "text-sm font-semibold" },
    cell: ({ row }) => measurementValue(row.original),
  },
  {
    id: "experiment",
    accessorKey: "experimentName",
    header: "Experiment",
    meta: { headClassName: "w-[190px]", cellClassName: "text-[13px]" },
  },
  {
    id: "recordedBy",
    accessorFn: (m) => m.recordedByName ?? "",
    header: "Recorded By",
    meta: { headClassName: "w-[170px]" },
    cell: ({ row }) =>
      row.original.recordedByName ? (
        <div className="flex items-center gap-2">
          <Avatar className="size-6 bg-muted">
            <AvatarFallback className="bg-muted text-[10px] font-semibold">
              {initials(row.original.recordedByName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[13px]">{row.original.recordedByName}</span>
        </div>
      ) : (
        <span className="text-[13px] text-muted-foreground">—</span>
      ),
  },
  {
    id: "recorded",
    accessorKey: "recordedAt",
    header: "Recorded",
    meta: { headClassName: "w-[110px]", cellClassName: "text-[13px] text-muted-foreground" },
    cell: ({ row }) => relativeTime(row.original.recordedAt),
  },
];

export function MeasurementsPage() {
  const { data, isLoading, isError } = useGetMeasurements();
  const [search, setSearch] = useState("");
  const [definitionFilter, setDefinitionFilter] = useState("all");
  const [experimentFilter, setExperimentFilter] = useState("all");
  const [editing, setEditing] = useState<Measurement | null>(null);

  const allMeasurements = data ?? [];

  const definitionNames = Array.from(
    new Set(allMeasurements.map((m) => m.definitionName)),
  ).sort();

  const experiments = Array.from(
    new Map(allMeasurements.map((m) => [m.experimentId, m.experimentName])).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const filtered = allMeasurements.filter((m) => {
    const term = search.toLowerCase();
    const matchesSearch =
      m.definitionName.toLowerCase().includes(term) ||
      m.experimentName.toLowerCase().includes(term) ||
      measurementValue(m).toLowerCase().includes(term) ||
      (m.recordedByName?.toLowerCase().includes(term) ?? false);
    const matchesDefinition =
      definitionFilter === "all" || m.definitionName === definitionFilter;
    const matchesExperiment =
      experimentFilter === "all" || m.experimentId === experimentFilter;
    return matchesSearch && matchesDefinition && matchesExperiment;
  });

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Measurements</h1>
          <p className="text-sm text-muted-foreground">
            Recorded data points across all experiments
          </p>
        </div>
        <CreateMeasurementDialog />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-8"
            placeholder="Search measurements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          items={Object.fromEntries(experiments)}
          value={experimentFilter === "all" ? undefined : experimentFilter}
          onValueChange={(v) => setExperimentFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All experiments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All experiments</SelectItem>
            {experiments.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={definitionFilter === "all" ? undefined : definitionFilter}
          onValueChange={(v) => setDefinitionFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All definitions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All definitions</SelectItem>
            {definitionNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        noun="measurements"
        isLoading={isLoading}
        isError={isError}
        onRowClick={(m) => setEditing(m)}
      />

      <EditMeasurementDialog
        open={editing !== null}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        measurement={editing}
      />
    </div>
  );
}
