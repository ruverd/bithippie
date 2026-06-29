# CLAUDE.md — @lab/web

Frontend-specific guidance. Monorepo context: see `/CLAUDE.md`. Product design: `/docs/superpowers/specs/2026-06-25-lab-experiment-tracking-design.md`.

## Purpose

React SPA for the lab experiment tracking system. Full app: routing, layout shell, dashboard, and CRUD UI for projects, experiments, samples, measurements, and researchers. The typed API layer is generated from the API's OpenAPI spec via Kubb.

API base URL: `VITE_API_URL`, defaulting to same-origin `/api`. In dev, Vite proxies `/api` → `http://localhost:3000` and strips the prefix (`vite.config.ts`). Leave `VITE_API_URL` unset locally.

## Stack

- React 19, Vite 8, TypeScript 6
- Tailwind CSS v4, shadcn/ui (base-nova, `@base-ui/react`, lucide)
- React Router DOM 7, TanStack React Query 5, TanStack Table
- React Hook Form, Zod (v3 — matches `@lab/shared`)
- Kubb 4 (codegen → `src/generated/`)
- Recharts, Sonner, cmdk, date-fns
- Vitest 4 (unit + Storybook browser), Storybook 10, Playwright, oxlint

## Layout

```
src/
  main.tsx
  index.css                Tailwind + shadcn tokens
  app/
    providers.tsx          QueryClientProvider + Sonner Toaster
    layout.tsx             shell (sidebar + top bar) + Outlet
    router.tsx             createBrowserRouter
    pages/                 page components, one folder per route
  features/                domain UI per entity (dashboard, projects,
                           experiments, samples, measurements, researchers)
                           e.g. measurements/components/MeasurementValueField.tsx
  components/
    ui/                    shadcn primitives
    layout/                app-top-bar, lab-sidebar, nav-items
    command-palette/       cmdk palette + context
    data-table, simple-table, form-field, chip-multi-select,
    date-picker, empty, meta-chip, status-badge, titled-card
  lib/
    api-client.ts          custom Kubb fetch client (throws ApiError on non-2xx)
    invalidate-queries.ts  React Query cache invalidation helpers
    utils.ts               cn()
  generated/               Kubb output — clients/, hooks/, types/ (do not edit)
  hooks/  constants/  utils/  test/  assets/
e2e/                       Playwright specs
.storybook/
kubb.config.ts             Kubb plugins + tag grouping
components.json            shadcn config
vite.config.ts             alias, vitest projects, dev proxy, ports
playwright.config.ts
```

Path alias: `@/` → `src/`.

## Commands

Run from `apps/web/` unless noted.

```bash
bun run dev              # :5173
bun run build            # tsc -b && vite build
bun run preview          # :5173
bun run lint             # oxlint
bun run test             # all Vitest projects (unit + storybook)
bun run test:unit        # jsdom Vitest
bun run test:storybook   # browser Vitest via Storybook (chromium)
bun run test:e2e         # Playwright (webServer builds + previews on :5173)
bun run storybook        # :6006
bun run build-storybook
bun run codegen          # kubb generate — needs ../api/openapi.json
```

From repo root: `bun run dev:web`, `bun run test:web`.

## Providers and routing

- `Providers` wraps the tree with `QueryClientProvider` and the Sonner `Toaster`
- `Layout` is mounted at `/`; routes live in `router.tsx`. Current routes: dashboard (index), `projects` + `:projectId`, `experiments` + `:experimentId`, `samples` + `:sampleId`, `measurements`, `researchers`
- Add a page under `src/app/pages/<route>/` and register it in `router.tsx`
- Keep pages thin — compose feature components from `src/features/`

## shadcn

- Config: `components.json` (style: base-nova, base color: neutral, icons: lucide)
- Add components: `bunx --bun shadcn@latest add <component>` from `apps/web/`
- Components land in `src/components/ui/`
- Global styles: `src/index.css` (Tailwind + shadcn tokens)

## Kubb

`kubb.config.ts` reads `../api/openapi.json` and writes `src/generated/` (cleaned each run). Plugins wired: `@kubb/plugin-oas`, `@kubb/plugin-ts` (→ `types/`), `@kubb/plugin-client` (→ `clients/`, import path `@/lib/api-client`), `@kubb/plugin-react-query` (→ `hooks/`, with `*Suspense` variants). Output is grouped by OpenAPI tag, camelCased as the folder name (`Experiments` → `experiments`).

Consume the generated React Query hooks from `@/generated`. Do not hand-edit `src/generated/` — rerun `bun run codegen` after the API contract changes. `@kubb/plugin-zod` is installed but not currently enabled in the config.

`lib/api-client.ts` is a custom fetch client: JSON `Content-Type`, query-string building, and it **throws `ApiError` on non-2xx** so failed writes hit React Query's `onError` instead of being treated as success.

## Validation strategy

Mirror the API's four layers at the UI boundary:

1. Zod/RHF — form shape (reuse `@lab/shared` where possible)
2. React Query — server state, mutations, cache invalidation (`lib/invalidate-queries.ts`)
3. Generated Kubb hooks — typed requests/responses
4. Backend remains source of truth for business rules

## Testing

| Target | Command | Location |
|--------|---------|----------|
| Unit | `test:unit` | `src/**/*.test.{ts,tsx}` (jsdom) |
| Storybook | `test:storybook` | `src/**/*.stories.{ts,tsx}` (browser, chromium) |
| E2E | `test:e2e` | `e2e/*.spec.ts` |

E2E `webServer` runs `build && preview` on `:5173` (see `playwright.config.ts`). Storybook preview imports `src/index.css` for Tailwind/shadcn styles. Shared test helpers in `src/test/` (`render.tsx`, `setup.ts`).

## Conventions

- Minimal diffs; match existing feature/page/component patterns
- No code comments unless strictly necessary
- Exhaustive `switch` with `never` default for unions
- Imports at top of file
- Use shadcn components before custom markup
- Semantic Tailwind tokens (`bg-background`, `text-muted-foreground`) — not raw color utilities
- Only commit when explicitly asked
