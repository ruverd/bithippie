import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useGetMeasurements } from "@/generated/hooks/measurementsController/useGetMeasurements";
import type { GetMeasurements200 } from "@/generated/types/measurementsController/GetMeasurements";
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

type Measurement = GetMeasurements200[number];

function formatValue(m: Measurement): string {
  switch (m.valueType) {
    case "NUMERIC":
      return m.numericValue == null
        ? "—"
        : `${m.numericValue}${m.unit ? ` ${m.unit}` : ""}`;
    case "CATEGORICAL":
      return m.categoricalValue ?? "—";
    case "TEXT":
      return m.textValue ? `“${m.textValue}”` : "—";
    default: {
      const _exhaustive: never = m.valueType;
      return _exhaustive;
    }
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

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
    accessorFn: (m) => formatValue(m),
    header: "Value",
    meta: { headClassName: "w-[130px]", cellClassName: "text-sm font-semibold" },
    cell: ({ row }) => formatValue(row.original),
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

  const allMeasurements = data ?? [];

  const definitionNames = Array.from(
    new Set(allMeasurements.map((m) => m.definitionName)),
  ).sort();

  const filtered = allMeasurements.filter((m) => {
    const term = search.toLowerCase();
    const matchesSearch =
      m.definitionName.toLowerCase().includes(term) ||
      m.experimentName.toLowerCase().includes(term) ||
      formatValue(m).toLowerCase().includes(term) ||
      (m.recordedByName?.toLowerCase().includes(term) ?? false);
    const matchesDefinition =
      definitionFilter === "all" || m.definitionName === definitionFilter;
    return matchesSearch && matchesDefinition;
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
        <Button>
          <Plus size={16} />
          New Measurement
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
            placeholder="Search measurements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
      />
    </div>
  );
}
