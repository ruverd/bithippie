import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const barHeights = [
  "h-[45%]",
  "h-[70%]",
  "h-[55%]",
  "h-[85%]",
  "h-[60%]",
  "h-[95%]",
  "h-[72%]",
  "h-[65%]",
];

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5" role="status">
      <div className="flex gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="flex h-80 gap-5">
        <BarChartSkeleton />
        <DonutSkeleton />
      </div>

      <div className="flex min-h-0 flex-1 gap-5">
        <TableSkeleton />
        <ListSkeleton />
      </div>

      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="flex-1 rounded-xl bg-card">
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}

function BarChartSkeleton() {
  return (
    <Card className="flex flex-1 flex-col p-5">
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-28" />
      </CardHeader>
      <CardContent className="flex flex-1 items-end gap-3 p-0">
        {barHeights.map((height, i) => (
          <Skeleton key={i} className={`flex-1 rounded-md ${height}`} />
        ))}
      </CardContent>
    </Card>
  );
}

function DonutSkeleton() {
  return (
    <Card className="flex w-[380px] shrink-0 flex-col p-5">
      <CardHeader className="p-0 pb-4">
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent className="flex flex-1 items-center gap-5 p-0">
        <Skeleton className="size-[160px] shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-2.5 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card className="flex flex-1 flex-col overflow-hidden p-0">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3.5 w-14" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-5 py-3.5 last:border-0"
          >
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3.5 w-14" />
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <Card className="flex w-[380px] shrink-0 flex-col overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 px-2 py-2.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
