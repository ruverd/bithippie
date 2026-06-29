import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useGetSamples } from "@/generated/hooks/samples/useGetSamples";
import { SampleFormDialog } from "@/features/samples/components/sample-form-dialog";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
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
import { formatDate } from "@/utils/format-date";

type Sample = GetSamples200[number];

const columns: ColumnDef<Sample>[] = [
  {
    id: "code",
    accessorKey: "code",
    header: "Code",
    meta: { headClassName: "w-[130px]", cellClassName: "text-sm font-semibold" },
  },
  {
    id: "specimenType",
    accessorKey: "specimenType",
    header: "Specimen Type",
    meta: { cellClassName: "text-sm" },
  },
  {
    id: "collected",
    accessorKey: "collectedAt",
    header: "Collected",
    meta: { headClassName: "w-[140px]", cellClassName: "text-[13px] text-muted-foreground" },
    cell: ({ row }) => formatDate(row.original.collectedAt),
  },
  {
    id: "storage",
    accessorFn: (sample) => sample.storageLocation ?? "",
    header: "Storage",
    meta: { headClassName: "w-[170px]", cellClassName: "text-[13px]" },
    cell: ({ row }) =>
      row.original.storageLocation ?? (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "experiments",
    accessorKey: "experimentCount",
    header: "Experiments",
    meta: { headClassName: "w-[110px]", cellClassName: "text-sm" },
  },
];

export function SamplesPage() {
  const { data, isLoading, isError } = useGetSamples();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; sample: Sample } | null
  >(null);

  const allSamples = data ?? [];

  const specimenTypes = Array.from(
    new Set(allSamples.map((sample) => sample.specimenType)),
  ).sort();

  const filtered = allSamples.filter((sample) => {
    const term = search.toLowerCase();
    const matchesSearch =
      sample.code.toLowerCase().includes(term) ||
      sample.specimenType.toLowerCase().includes(term) ||
      (sample.storageLocation?.toLowerCase().includes(term) ?? false);
    const matchesType = typeFilter === "all" || sample.specimenType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Samples</h1>
          <p className="text-sm text-muted-foreground">
            Specimens tracked across experiments
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus size={16} />
          Register Sample
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
            placeholder="Search samples…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          value={typeFilter === "all" ? undefined : typeFilter}
          onValueChange={(v) => setTypeFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {specimenTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        noun="samples"
        isLoading={isLoading}
        isError={isError}
        onRowClick={(s) => setDialog({ mode: "edit", sample: s })}
      />

      <SampleFormDialog
        open={dialog !== null}
        onOpenChange={(o) => {
          if (!o) setDialog(null);
        }}
        sample={dialog?.mode === "edit" ? dialog.sample : null}
      />
    </div>
  );
}
