# Dashboard Real Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the web dashboard's hardcoded placeholder data with real data aggregated client-side from the existing list endpoints.

**Architecture:** `DashboardPage` calls the four existing generated list hooks (`useGetProjects/Experiments/Samples/Measurements`) and feeds the results through pure functions in a new `aggregate.ts` that produce each widget's props. Widgets stay presentational. The seed spreads measurement dates over 12 months so the 8-month bar chart is populated.

**Tech Stack:** React 19, Vite, TanStack React Query, Recharts, Vitest; Bun; Prisma (seed only). Spec: `docs/superpowers/specs/2026-06-27-dashboard-real-data-design.md`.

## Global Constraints

- TypeScript strict; `noUncheckedIndexedAccess` is ON — index access yields `T | undefined`; use `!` or guards.
- Path alias `@/` → `apps/web/src/`.
- Reuse existing utils: `@/utils/measurement-value` (`measurementValue`), `@/utils/initials` (`initials`), `@/utils/relative-time` (`relativeTime`).
- No new backend endpoint. Only backend change is `apps/api/prisma/seed.ts`.
- Bar chart window = **8 months**; seed history = **12 months**.
- All commands run from `apps/web/` unless noted. Web unit tests: `bunx vitest run --project unit <path>`. Typecheck: `bunx tsc -b --noEmit`.
- Aggregation functions take an explicit `now: Date` for deterministic tests.
- Generated hook paths use bare-tag folders (e.g. `@/generated/hooks/projects/useGetProjects`), not `*Controller`.

---

### Task 1: Aggregation module (`aggregate.ts`)

Pure functions that turn API list payloads into widget props. This is the testable core.

**Files:**
- Create: `apps/web/src/features/dashboard/aggregate.ts`
- Test: `apps/web/src/features/dashboard/aggregate.test.ts`

**Interfaces:**
- Consumes: generated element types via `GetProjects200[number]` etc.; utils `measurementValue`, `initials`, `relativeTime`.
- Produces (later tasks rely on these exact names/types):
  - `statCards(projects, experiments, samples, measurements): DashboardStats` where `DashboardStats = { activeProjects: number; runningExperiments: number; samplesLogged: number; measurements: number }`
  - `measurementsByMonth(measurements, now: Date, monthsBack = 8): MonthlyCount[]` where `MonthlyCount = { m: string; v: number }`
  - `experimentsByStatus(experiments): StatusBreakdown` where `StatusBreakdown = { items: { status: string; count: number; color: string }[]; total: number }`
  - `recentMeasurements(measurements, limit = 5): RecentMeasurementRow[]` where `RecentMeasurementRow = { definition: string; experiment: string; value: string; recordedBy: string; time: string }`
  - `activeExperiments(experiments, limit = 5): ActiveExperimentItem[]` where `ActiveExperimentItem = { name: string; project: string; measurementCount: number }`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/features/dashboard/aggregate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  statCards,
  measurementsByMonth,
  experimentsByStatus,
  recentMeasurements,
  activeExperiments,
} from "./aggregate";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Project = GetProjects200[number];
type Experiment = GetExperiments200[number];
type Sample = GetSamples200[number];
type Measurement = GetMeasurements200[number];

const NOW = new Date("2026-06-15T12:00:00.000Z");

// Cast via `unknown` so the tests exercise aggregation logic without coupling to
// every generated field (the functions only read the fields set below).
const project = (status: string | null): Project =>
  ({ id: "p", title: "P", description: null, status }) as unknown as Project;
const sample = (): Sample =>
  ({
    id: "s",
    code: "C",
    specimenType: "blood",
    collectedAt: null,
    storageLocation: null,
    experimentCount: 0,
  }) as unknown as Sample;
const experiment = (over: Record<string, unknown> = {}): Experiment =>
  ({
    id: "e",
    title: "Exp",
    hypothesis: null,
    status: "ACTIVE",
    projectId: "p",
    projectName: "Proj",
    leadName: null,
    measurementCount: 0,
    startDate: null,
    ...over,
  }) as unknown as Experiment;
const measurement = (over: Record<string, unknown> = {}): Measurement =>
  ({
    id: "m",
    experimentId: "e",
    experimentName: "Exp",
    measurementDefinitionId: "d",
    definitionName: "Lead",
    valueType: "NUMERIC",
    numericValue: 1,
    unit: "mg/L",
    categoricalValue: null,
    textValue: null,
    notes: null,
    recordedAt: "2026-06-10T00:00:00.000Z",
    recordedById: "r",
    recordedByName: "Alice Nguyen",
    ...over,
  }) as unknown as Measurement;

describe("statCards", () => {
  it("should count active projects, active experiments, samples and measurements", () => {
    const result = statCards(
      [project("ACTIVE"), project("PLANNING"), project(null)],
      [experiment({ status: "ACTIVE" }), experiment({ status: "COMPLETED" })],
      [sample(), sample(), sample()],
      [measurement(), measurement()],
    );
    expect(result).toEqual({
      activeProjects: 1,
      runningExperiments: 1,
      samplesLogged: 3,
      measurements: 2,
    });
  });
});

describe("measurementsByMonth", () => {
  it("should return monthsBack buckets ending at now, zero-filled", () => {
    const result = measurementsByMonth([], NOW, 8);
    expect(result).toHaveLength(8);
    expect(result[7]).toEqual({ m: "Jun", v: 0 });
    expect(result[0]).toEqual({ m: "Nov", v: 0 });
  });

  it("should count measurements into their recordedAt month and ignore out-of-window", () => {
    const result = measurementsByMonth(
      [
        measurement({ recordedAt: "2026-06-01T00:00:00.000Z" }),
        measurement({ recordedAt: "2026-06-20T00:00:00.000Z" }),
        measurement({ recordedAt: "2026-05-10T00:00:00.000Z" }),
        measurement({ recordedAt: "2024-01-01T00:00:00.000Z" }),
        measurement({ recordedAt: "not-a-date" }),
      ],
      NOW,
      8,
    );
    expect(result.find((b) => b.m === "Jun")?.v).toBe(2);
    expect(result.find((b) => b.m === "May")?.v).toBe(1);
    expect(result.reduce((s, b) => s + b.v, 0)).toBe(3);
  });
});

describe("experimentsByStatus", () => {
  it("should group known statuses, map labels/colors, sum total, exclude null/unknown", () => {
    const result = experimentsByStatus([
      experiment({ status: "ACTIVE" }),
      experiment({ status: "ACTIVE" }),
      experiment({ status: "COMPLETED" }),
      experiment({ status: null }),
      experiment({ status: "WEIRD" }),
    ]);
    expect(result.total).toBe(3);
    expect(result.items).toEqual([
      { status: "Active", count: 2, color: "var(--chart-1)" },
      { status: "Completed", count: 1, color: "var(--chart-2)" },
    ]);
  });
});

describe("recentMeasurements", () => {
  it("should take the first N and format via the shared utils", () => {
    const rows = recentMeasurements([measurement()], 5);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({
      definition: "Lead",
      experiment: "Exp",
      value: "1 mg/L",
      recordedBy: "AN",
      time: expect.any(String),
    });
  });
});

describe("activeExperiments", () => {
  it("should keep only ACTIVE, cap at the limit, and expose measurementCount", () => {
    const result = activeExperiments(
      [
        experiment({ title: "A", projectName: "Water", measurementCount: 3, status: "ACTIVE" }),
        experiment({ title: "B", status: "COMPLETED" }),
      ],
      5,
    );
    expect(result).toEqual([{ name: "A", project: "Water", measurementCount: 3 }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd apps/web && bunx vitest run --project unit src/features/dashboard/aggregate.test.ts`
Expected: FAIL — `Failed to resolve import "./aggregate"` / functions not defined.

- [ ] **Step 3: Write the implementation**

Create `apps/web/src/features/dashboard/aggregate.ts`:

```ts
import { measurementValue } from "@/utils/measurement-value";
import { initials } from "@/utils/initials";
import { relativeTime } from "@/utils/relative-time";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";

type Project = GetProjects200[number];
type Experiment = GetExperiments200[number];
type Sample = GetSamples200[number];
type Measurement = GetMeasurements200[number];

export interface DashboardStats {
  activeProjects: number;
  runningExperiments: number;
  samplesLogged: number;
  measurements: number;
}

export function statCards(
  projects: Project[],
  experiments: Experiment[],
  samples: Sample[],
  measurements: Measurement[],
): DashboardStats {
  return {
    activeProjects: projects.filter((p) => p.status === "ACTIVE").length,
    runningExperiments: experiments.filter((e) => e.status === "ACTIVE").length,
    samplesLogged: samples.length,
    measurements: measurements.length,
  };
}

export interface MonthlyCount {
  m: string;
  v: number;
}

export function measurementsByMonth(
  measurements: Measurement[],
  now: Date,
  monthsBack = 8,
): MonthlyCount[] {
  const buckets: MonthlyCount[] = [];
  const indexByKey = new Map<string, number>();
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    indexByKey.set(`${d.getFullYear()}-${d.getMonth()}`, buckets.length);
    buckets.push({ m: d.toLocaleString("en-US", { month: "short" }), v: 0 });
  }
  for (const meas of measurements) {
    const d = new Date(meas.recordedAt);
    if (Number.isNaN(d.getTime())) continue;
    const at = indexByKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (at !== undefined) buckets[at]!.v += 1;
  }
  return buckets;
}

const STATUS_ORDER = ["ACTIVE", "COMPLETED", "PLANNING", "CANCELLED"] as const;
const STATUS_META: Record<(typeof STATUS_ORDER)[number], { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "var(--chart-1)" },
  COMPLETED: { label: "Completed", color: "var(--chart-2)" },
  PLANNING: { label: "Planning", color: "var(--chart-3)" },
  CANCELLED: { label: "Cancelled", color: "var(--chart-4)" },
};

export interface StatusBreakdown {
  items: { status: string; count: number; color: string }[];
  total: number;
}

export function experimentsByStatus(experiments: Experiment[]): StatusBreakdown {
  const counts = new Map<string, number>();
  for (const e of experiments) {
    if (e.status && e.status in STATUS_META) {
      counts.set(e.status, (counts.get(e.status) ?? 0) + 1);
    }
  }
  const items = STATUS_ORDER.filter((s) => (counts.get(s) ?? 0) > 0).map((s) => ({
    status: STATUS_META[s].label,
    count: counts.get(s) ?? 0,
    color: STATUS_META[s].color,
  }));
  const total = items.reduce((sum, it) => sum + it.count, 0);
  return { items, total };
}

export interface RecentMeasurementRow {
  definition: string;
  experiment: string;
  value: string;
  recordedBy: string;
  time: string;
}

export function recentMeasurements(measurements: Measurement[], limit = 5): RecentMeasurementRow[] {
  return measurements.slice(0, limit).map((m) => ({
    definition: m.definitionName,
    experiment: m.experimentName,
    value: measurementValue(m),
    recordedBy: initials(m.recordedByName ?? ""),
    time: relativeTime(m.recordedAt),
  }));
}

export interface ActiveExperimentItem {
  name: string;
  project: string;
  measurementCount: number;
}

export function activeExperiments(experiments: Experiment[], limit = 5): ActiveExperimentItem[] {
  return experiments
    .filter((e) => e.status === "ACTIVE")
    .slice(0, limit)
    .map((e) => ({ name: e.title, project: e.projectName, measurementCount: e.measurementCount }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd apps/web && bunx vitest run --project unit src/features/dashboard/aggregate.test.ts`
Expected: PASS (5 describes, 6 tests).

- [ ] **Step 5: Typecheck**

Run: `cd apps/web && bunx tsc -b --noEmit`
Expected: exit 0 (no errors).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/dashboard/aggregate.ts apps/web/src/features/dashboard/aggregate.test.ts
git commit -m "feat(web): dashboard aggregation helpers"
```

---

### Task 2: Widget prop changes

Make `StatCard.delta` optional, switch `ActiveExperimentsList` from `progress` to `measurementCount`, wire "View all" to the measurements route, and delete the placeholder consts.

**Files:**
- Modify: `apps/web/src/features/dashboard/stat-card.tsx`
- Modify: `apps/web/src/features/dashboard/active-experiments-list.tsx`
- Modify: `apps/web/src/features/dashboard/recent-measurements-table.tsx`
- Modify: `apps/web/src/features/dashboard/measurements-bar-chart.tsx`
- Modify: `apps/web/src/features/dashboard/experiments-status-donut.tsx`

**Interfaces:**
- Produces: `StatCardProps.delta?: string`; `ActiveExperiment = { name: string; project: string; measurementCount: number }`. These match Task 1's `ActiveExperimentItem` and Task 3's usage.

- [ ] **Step 1: Make `StatCard.delta` optional**

In `stat-card.tsx` change the interface and render. Replace:

```tsx
interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta: string;
}
```
with:
```tsx
interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
}
```
and replace the trend block:
```tsx
        <div className="flex items-center gap-1">
          <TrendingUp size={14} className="text-primary" />
          <span className="text-xs text-muted-foreground">{delta}</span>
        </div>
```
with:
```tsx
        {delta ? (
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">{delta}</span>
          </div>
        ) : null}
```

- [ ] **Step 2: Switch `active-experiments-list.tsx` to `measurementCount`**

Replace the interface + placeholder + progress bar. New file contents:

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

interface ActiveExperiment {
  name: string;
  project: string;
  measurementCount: number;
}

interface ActiveExperimentsListProps {
  experiments: ActiveExperiment[];
}

export function ActiveExperimentsList({ experiments }: ActiveExperimentsListProps) {
  return (
    <Card className="flex w-[380px] shrink-0 flex-col overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <p className="text-base font-semibold">Active Experiments</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5 p-2">
        {experiments.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            No active experiments.
          </p>
        ) : (
          experiments.map((exp) => (
            <div
              key={exp.name}
              className="flex flex-col gap-1.5 rounded-lg px-2 py-2.5 hover:bg-muted/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{exp.name}</span>
                <StatusBadge status="Active" />
              </div>
              <p className="text-xs text-muted-foreground">{exp.project}</p>
              <p className="text-xs text-muted-foreground">
                {exp.measurementCount} measurements
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Wire "View all" + drop placeholder in `recent-measurements-table.tsx`**

Add the import at the top:
```tsx
import { Link } from "react-router-dom";
```
Delete the entire `// TODO: bind to API` block and the `export const RECENT_MEASUREMENTS_PLACEHOLDER: MeasurementRow[] = [ ... ];`.
Replace the link:
```tsx
        <a href="#" className="text-[13px] font-medium text-primary">
          View all
        </a>
```
with:
```tsx
        <Link to="/measurements" className="text-[13px] font-medium text-primary">
          View all
        </Link>
```
Add an empty-state row inside `<TableBody>` — replace `{rows.map(...)}` with:
```tsx
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No measurements yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.definition}-${row.time}`}>
                  <TableCell className="text-sm font-medium">{row.definition}</TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{row.experiment}</TableCell>
                  <TableCell className="text-sm font-semibold">{row.value}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 bg-muted">
                        <AvatarFallback className="bg-muted text-[10px] font-semibold">{row.recordedBy}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{row.recordedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">{row.time}</TableCell>
                </TableRow>
              ))
            )}
```

- [ ] **Step 4: Drop placeholder exports in the two chart widgets**

In `measurements-bar-chart.tsx` delete the `// TODO: bind to stats endpoint` comment and the `export const MEASUREMENTS_PLACEHOLDER: MonthlyCount[] = [ ... ];` block.
In `experiments-status-donut.tsx` delete the `// TODO: bind to stats endpoint` comment and the `export const EXPERIMENTS_STATUS_PLACEHOLDER: ExperimentStatusItem[] = [ ... ];` block.
(Leave the components and their internal `interface`/`chartConfig` untouched.)

- [ ] **Step 5: Typecheck**

Run: `cd apps/web && bunx tsc -b --noEmit`
Expected: errors ONLY in `dashboard-page.tsx` (still imports the deleted placeholders + passes `progress`). That's fixed in Task 3. Confirm there are no errors in the five widget files themselves.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/features/dashboard/stat-card.tsx apps/web/src/features/dashboard/active-experiments-list.tsx apps/web/src/features/dashboard/recent-measurements-table.tsx apps/web/src/features/dashboard/measurements-bar-chart.tsx apps/web/src/features/dashboard/experiments-status-donut.tsx
git commit -m "refactor(web): dashboard widgets accept real-data props"
```

---

### Task 3: Wire `DashboardPage` to real data

Fetch the four lists, aggregate, render with loading/error/empty handling; header always renders; wire "New Experiment" and the date subtitle.

**Files:**
- Modify (rewrite): `apps/web/src/features/dashboard/dashboard-page.tsx`

**Interfaces:**
- Consumes: all of Task 1's functions; Task 2's widget props; `CreateExperimentDialog` from `@/features/experiments/create-experiment-dialog`; generated hooks.

- [ ] **Step 1: Rewrite `dashboard-page.tsx`**

```tsx
import { FolderKanban, FlaskConical, TestTube, Activity, type LucideIcon } from "lucide-react";
import { StatCard } from "./stat-card";
import { MeasurementsBarChart } from "./measurements-bar-chart";
import { ExperimentsStatusDonut } from "./experiments-status-donut";
import { RecentMeasurementsTable } from "./recent-measurements-table";
import { ActiveExperimentsList } from "./active-experiments-list";
import { CreateExperimentDialog } from "@/features/experiments/create-experiment-dialog";
import { useGetProjects } from "@/generated/hooks/projects/useGetProjects";
import { useGetExperiments } from "@/generated/hooks/experiments/useGetExperiments";
import { useGetSamples } from "@/generated/hooks/samples/useGetSamples";
import { useGetMeasurements } from "@/generated/hooks/measurements/useGetMeasurements";
import type { GetProjects200 } from "@/generated/types/projects/GetProjects";
import type { GetExperiments200 } from "@/generated/types/experiments/GetExperiments";
import type { GetSamples200 } from "@/generated/types/samples/GetSamples";
import type { GetMeasurements200 } from "@/generated/types/measurements/GetMeasurements";
import {
  statCards,
  measurementsByMonth,
  experimentsByStatus,
  recentMeasurements,
  activeExperiments,
} from "./aggregate";

export function DashboardPage() {
  const projects = useGetProjects();
  const experiments = useGetExperiments();
  const samples = useGetSamples();
  const measurements = useGetMeasurements();

  const queries = [projects, experiments, samples, measurements];
  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  const now = new Date();
  const today = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold leading-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Lab activity overview · {today}</p>
        </div>
        <CreateExperimentDialog />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : isError ? (
        <p className="text-sm text-muted-foreground" role="alert">
          Failed to load dashboard data.
        </p>
      ) : (
        <DashboardContent
          projects={projects.data ?? []}
          experiments={experiments.data ?? []}
          samples={samples.data ?? []}
          measurements={measurements.data ?? []}
          now={now}
        />
      )}
    </div>
  );
}

interface DashboardContentProps {
  projects: GetProjects200;
  experiments: GetExperiments200;
  samples: GetSamples200;
  measurements: GetMeasurements200;
  now: Date;
}

function DashboardContent({
  projects,
  experiments,
  samples,
  measurements,
  now,
}: DashboardContentProps) {
  const stats = statCards(projects, experiments, samples, measurements);
  const status = experimentsByStatus(experiments);

  const cards: { label: string; icon: LucideIcon; value: number }[] = [
    { label: "Active Projects", icon: FolderKanban, value: stats.activeProjects },
    { label: "Running Experiments", icon: FlaskConical, value: stats.runningExperiments },
    { label: "Samples Logged", icon: TestTube, value: stats.samplesLogged },
    { label: "Measurements", icon: Activity, value: stats.measurements },
  ];

  return (
    <>
      <div className="flex gap-5">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            icon={card.icon}
            value={card.value.toLocaleString()}
          />
        ))}
      </div>

      <div className="flex h-80 gap-5">
        <MeasurementsBarChart data={measurementsByMonth(measurements, now)} />
        <ExperimentsStatusDonut data={status.items} total={status.total} />
      </div>

      <div className="flex min-h-0 flex-1 gap-5">
        <RecentMeasurementsTable rows={recentMeasurements(measurements)} />
        <ActiveExperimentsList experiments={activeExperiments(experiments)} />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd apps/web && bunx tsc -b --noEmit`
Expected: exit 0 (no errors anywhere — the Task 2 dangling errors are resolved).

- [ ] **Step 3: Run the full web unit suite**

Run: `cd apps/web && bunx vitest run --project unit`
Expected: PASS (all files, including `aggregate.test.ts`).

- [ ] **Step 4: Run the web e2e (nav still green)**

Run: `cd apps/web && bun run test:e2e`
Expected: 4 passed — the Dashboard heading still renders (header is outside the loading/error branch). Data fetches fail against the down API but the page does not crash.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/dashboard/dashboard-page.tsx
git commit -m "feat(web): wire dashboard to real data via client-side aggregation"
```

---

### Task 4: Seed 12-month measurement history

Spread bulk measurement `recordedAt` over the last year so the bar chart is populated.

**Files:**
- Modify: `apps/api/prisma/seed.ts`

- [ ] **Step 1: Change the bulk measurement date**

In `apps/api/prisma/seed.ts`, inside the measurements `for` loop that builds `measRows`, change:
```ts
        recordedAt: faker.date.recent({ days: 90 }),
```
to:
```ts
        recordedAt: faker.date.past({ years: 1 }),
```
(Leave the anchored `seed-meas-*` rows and `createMany({ ..., skipDuplicates: true })` untouched.)

- [ ] **Step 2: Verify seed idempotency test still passes**

This requires a running Postgres and resets it (destructive — dev DB only). Run from `apps/api/`:
```bash
docker compose up -d db   # from repo root, if not already running
cd apps/api && bun run test:db
```
Expected: `prisma/__tests__` — 4 passed (constraints 3 + seed idempotency 1). `seed-meas-*` count stays 5; bulk rows are `f-meas-*`.
Note: `test:db` runs `prisma migrate reset`, which trips Prisma's AI-agent guard — a human runs this step, or set `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` per the repo's CLAUDE.md when running headless against the dev DB.

- [ ] **Step 3: Commit**

```bash
git add apps/api/prisma/seed.ts
git commit -m "feat(api): spread seed measurement dates over 12 months for dashboard history"
```

---

## Final verification

- [ ] `cd apps/web && bunx tsc -b --noEmit` → exit 0
- [ ] `cd apps/web && bunx vitest run --project unit` → all pass
- [ ] `cd apps/web && bun run test:e2e` → 4 passed
- [ ] (DB available) `cd apps/api && bun run test:db` → 4 passed
- [ ] Manual smoke (optional): `bun run start` (repo root) with Postgres up + migrated/seeded → open `http://localhost:5173/` → stat cards show real counts, bar chart populated across months, donut reflects experiment statuses, recent measurements + active experiments list real rows.

## Notes for the implementer

- No leftover references to `MEASUREMENTS_PLACEHOLDER`, `EXPERIMENTS_STATUS_PLACEHOLDER`, `RECENT_MEASUREMENTS_PLACEHOLDER`, `ACTIVE_EXPERIMENTS_PLACEHOLDER` may remain after Task 3 — `bunx tsc -b --noEmit` will fail if any do.
- `measurementValue` accepts a structural `{ valueType, numericValue, unit, categoricalValue, textValue }`; a full `Measurement` satisfies it (extra fields are fine).
- The donut center shows `total`; with zero experiments `items` is `[]` and `total` is `0` — Recharts renders no slices, no divide-by-zero. No extra guard needed.
