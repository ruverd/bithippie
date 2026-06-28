export function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border bg-card px-3.5 py-2.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="text-[15px] font-semibold">{value}</span>
    </div>
  );
}
