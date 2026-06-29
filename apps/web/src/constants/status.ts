export const STATUSES = ["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export type StatusFilter = "all" | Status;
