# Dashboard real data — design

**Date:** 2026-06-27
**Status:** Approved (pending spec review)

## Problem

The web dashboard (`/`, `apps/web/src/features/dashboard/`) is the only screen not
backed by the API. Every widget renders hardcoded constants:

- Stat cards: `STAT_CARDS` literals (`"8"`, `"18"`, `"1,204"`, `"8,640"` + fake deltas)
- `MeasurementsBarChart` → `MEASUREMENTS_PLACEHOLDER`
- `ExperimentsStatusDonut` → `EXPERIMENTS_STATUS_PLACEHOLDER` (`total={18}`)
- `RecentMeasurementsTable` → `RECENT_MEASUREMENTS_PLACEHOLDER`
- `ActiveExperimentsList` → `ACTIVE_EXPERIMENTS_PLACEHOLDER`

Every other screen already uses the generated hooks against the real API. Goal: wire
the dashboard to real data via **client-side aggregation** of the existing list
endpoints, and adjust the seed so historical charts are meaningful.

## Approach

**Client-side aggregation.** `DashboardPage` calls the four existing list hooks and
transforms the results into widget props with pure functions. No new backend endpoint.
Only backend change: spread seed measurement dates over the last 12 months.

Rejected: a `GET /stats/dashboard` endpoint (more scope — route + service + repo +
tests; unjustified at this scale). Noted as the future optimization if `/measurements`
volume makes the bar-chart aggregation too heavy.

### Known tradeoff

The bar chart buckets **all** measurements by month, so `useGetMeasurements()` fetches
the full measurements list (bulk seed is a few thousand rows) just to compute counts.
Acceptable at demo scale. If it grows, move month-bucketing server-side first (the
`/stats` endpoint above).

## Architecture & data flow

```
DashboardPage
 ├─ useGetProjects / useGetExperiments / useGetSamples / useGetMeasurements   (existing hooks)
 ├─ aggregate.ts   (pure functions: lists + now → widget props)
 └─ StatCard ×4, MeasurementsBarChart, ExperimentsStatusDonut,
            RecentMeasurementsTable, ActiveExperimentsList
```

- New module `apps/web/src/features/dashboard/aggregate.ts` holds all transforms as
  pure functions. Each takes the relevant array(s) plus a `now: Date` argument
  (default `new Date()`) so tests are deterministic.
- Widgets stay presentational. The page `<h1>Dashboard</h1>` header renders **always**;
  only the widget area below it swaps for loading/error. This keeps the existing
  navigation e2e (`e2e/navigation.spec.ts`, asserts the Dashboard heading) green even
  though web e2e runs with the API down.

## Per-widget aggregation

All inputs come from existing payloads; formatting reuses existing utils
(`@/utils/measurement-value`, `@/utils/initials`, `@/utils/relative-time`).

| Widget | Transform |
|--------|-----------|
| Stat cards | `activeProjects` = projects where `status === "ACTIVE"`; `runningExperiments` = experiments where `status === "ACTIVE"`; `samplesLogged` = `samples.length`; `measurements` = `measurements.length`. Each rendered via `Number.toLocaleString()`. **No delta.** |
| Bar chart | Bucket measurements by `recordedAt` month → the last **8** months ending at `now`, including months with zero. Output `{ m: "Nov", v: number }[]` (short month label). |
| Donut | Group experiments by `status` → `{ status, count, color }[]` using a fixed status→chart-color map (`ACTIVE→chart-1`, `COMPLETED→chart-2`, `PLANNING→chart-3`, `CANCELLED→chart-4`); `total` = sum of the mapped buckets. Only the four known statuses are shown (count > 0); experiments with a `null`/unknown status are excluded from the donut and from `total`. |
| Recent measurements | Take the first 5 (API already returns `recordedAt` descending). Map each → `{ definition: definitionName, experiment: experimentName, value: measurementValue(m), recordedBy: initials(recordedByName ?? ""), time: relativeTime(recordedAt) }`. |
| Active experiments | Experiments where `status === "ACTIVE"`, take 5 → `{ name: title, project: projectName, measurementCount }`. |

### Aggregation function signatures (`aggregate.ts`)

```ts
statCards(projects, experiments, samples, measurements): {
  activeProjects: number; runningExperiments: number; samplesLogged: number; measurements: number;
}
measurementsByMonth(measurements, now: Date, monthsBack = 8): { m: string; v: number }[]
experimentsByStatus(experiments): { items: { status: string; count: number; color: string }[]; total: number }
recentMeasurements(measurements, limit = 5): MeasurementRow[]
activeExperiments(experiments, limit = 5): { name: string; project: string; measurementCount: number }[]
```

## Widget prop changes

- `StatCard`: make `delta` optional; `DashboardPage` stops passing it; the trend
  line renders only when `delta` is provided.
- `ActiveExperimentsList`: `ActiveExperiment.progress: number` → `measurementCount: number`;
  replace the progress bar with a `"{n} measurements"` line.
- Delete the four `*_PLACEHOLDER` exported consts from the widget files.

## Seed change (backend)

`apps/api/prisma/seed.ts`: the bulk faker measurements currently use
`recordedAt: faker.date.recent({ days: 90 })`. Change to `faker.date.past({ years: 1 })`
so dates span the last 12 months and the 8-month chart is fully populated.

- Anchored `seed-meas-*` rows are unchanged (they don't set `recordedAt`).
- `createMany({ skipDuplicates })` + deterministic `faker.seed` keep the seed idempotent.
- `prisma/__tests__/seed.test.ts` (counts `seed-meas-*` = 5) is unaffected (bulk rows are `f-meas-*`).

## Loading / empty / error

- **Loading:** while any of the four hooks is loading, the widget area shows a
  loading state (skeleton/"Loading…"); the header stays.
- **Error:** if any hook errors, the widget area shows an inline error message
  (`role="alert"`), consistent with the other pages.
- **Empty:** with zero rows — stat cards show `0`; the bar chart renders empty/zero
  bars with axis; the donut guards against `total === 0` (no divide-by-zero, shows
  `0` total); recent/active lists show an empty state. No crashes.

## Minor polish (in scope)

- "View all" link in `RecentMeasurementsTable` → `Link to="/measurements"`.
- Dashboard "New Experiment" button → reuse the existing `CreateExperimentDialog`.
- Hardcoded subtitle `"Friday, June 26, 2026"` → derive from `now` (locale date).

## Testing

- `apps/web/src/features/dashboard/aggregate.test.ts` (Vitest, colocated) with a fixed
  `now` and fixed input arrays:
  - stat counts (incl. status filtering and empty input)
  - month bucketing (correct 8-month window, zero-fill, correct labels)
  - status grouping + total + color mapping + statuses-absent case
  - recent: ordering preserved, limit, util formatting (value/initials/time)
  - active: ACTIVE filter, limit, `measurementCount` passthrough
- Existing nav + mobile e2e unchanged (dashboard still no API/DB requirement in e2e —
  data area degrades to loading/error, header asserts still pass).
- `bun run web:test` (unit) and `bun run api:test:db` (seed idempotency) stay green.

## Out of scope

- Backend `/stats` endpoint.
- Wiring the top-bar search.
- Real-time / polling refresh.
- Pagination of `/measurements` (the volume tradeoff is accepted, not solved here).

## Files

**web**
- `src/features/dashboard/aggregate.ts` (new)
- `src/features/dashboard/aggregate.test.ts` (new)
- `src/features/dashboard/dashboard-page.tsx` (rewrite: fetch + aggregate + states)
- `src/features/dashboard/stat-card.tsx` (`delta` optional)
- `src/features/dashboard/active-experiments-list.tsx` (`progress` → `measurementCount`)
- `src/features/dashboard/measurements-bar-chart.tsx` / `experiments-status-donut.tsx` /
  `recent-measurements-table.tsx` (drop placeholder exports; "View all" link)

**api**
- `prisma/seed.ts` (12-month measurement dates)
