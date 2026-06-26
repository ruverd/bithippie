import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | null | undefined;
}

type NormalizedStatus = "Active" | "Planning" | "Completed" | "Cancelled" | "On Hold" | "Unknown";

function normalizeStatus(raw: string | null | undefined): NormalizedStatus {
  switch (raw?.toUpperCase()) {
    case "ACTIVE":
      return "Active";
    case "PLANNING":
      return "Planning";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "ON HOLD":
      return "On Hold";
    case undefined:
    case null:
    case "":
      return "Unknown";
    default:
      return "Unknown";
  }
}

function statusClasses(status: NormalizedStatus): string {
  switch (status) {
    case "Active":
      return "bg-primary text-primary-foreground";
    case "Planning":
      return "bg-accent text-accent-foreground";
    case "Completed":
      return "bg-secondary text-secondary-foreground";
    case "Cancelled":
      return "bg-destructive text-white";
    case "On Hold":
      return "bg-brand-terracotta text-white";
    case "Unknown":
      return "bg-secondary text-secondary-foreground";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = normalizeStatus(status);
  if (normalized === "Unknown") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusClasses(normalized),
      )}
    >
      {normalized}
    </span>
  );
}
