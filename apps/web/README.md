# @lab/web

React SPA for the Laboratory Experiment Tracking system. Browses and edits researchers, projects, experiments, samples, and measurements served by `@lab/api`. Part of the Bun workspaces monorepo — see the repo root `README.md` and `CLAUDE.md` for the data model and overall design.

## Stack

- React 19, Vite 8, TypeScript 6
- Tailwind CSS v4 + shadcn/ui (`base-nova` style, `@base-ui/react`, lucide icons)
- React Router DOM 7, TanStack React Query 5, TanStack Table
- React Hook Form + Zod 3 (matches `@lab/shared`)
- Kubb 4 — generates the typed API client, React Query hooks, and types from the API's OpenAPI spec
- Recharts (dashboard), Sonner (toasts), cmdk (command palette), date-fns
- Vitest 4 (unit + Storybook browser), Storybook 10, Playwright (E2E), oxlint

## Quick start

```bash
bun install            # from repo root
cd apps/web
bun run dev            # http://localhost:5173
```

The API must be running on `http://localhost:3000` (see repo root `CLAUDE.md` / `docker compose up`). In dev the app calls same-origin `/api`, which Vite proxies to the API and strips the `/api` prefix.

## Commands

Run from `apps/web/` unless noted.

```bash
bun run dev              # Vite dev server :5173
bun run build            # tsc -b && vite build
bun run preview          # serve build on :5173
bun run lint             # oxlint
bun run test             # all Vitest projects (unit + storybook)
bun run test:unit        # jsdom unit tests
bun run test:storybook   # browser tests via Storybook (chromium)
bun run test:e2e         # Playwright — builds + previews, then runs e2e/
bun run storybook        # Storybook :6006
bun run build-storybook
bun run codegen          # kubb generate — regenerate src/generated/ from ../api/openapi.json
```

From repo root: `bun run dev:web`, `bun run test:web`.

## Layout

```
src/
  main.tsx
  index.css                 Tailwind + shadcn tokens
  app/
    providers.tsx           QueryClientProvider + Sonner Toaster
    layout.tsx              app shell (sidebar + top bar) + <Outlet/>
    router.tsx              createBrowserRouter
    pages/                  route page components (one folder per route)
      dashboard/ projects/ project-detail/ experiments/
      samples/ measurements/ researchers/
  features/                 domain UI grouped by entity
    dashboard/              charts, stat cards, content + skeleton, utils/
    projects/ experiments/ samples/ measurements/ researchers/
      components/           forms, dialogs, detail views
    measurements/components/MeasurementValueField.tsx   value input by valueType
  components/
    ui/                     shadcn primitives
    layout/                 app-top-bar, lab-sidebar, nav-items
    command-palette/        cmdk command palette + context
    data-table, simple-table, form-field, chip-multi-select,
    date-picker, empty, meta-chip, status-badge, titled-card
  lib/
    api-client.ts           custom Kubb fetch client (throws ApiError on non-2xx)
    invalidate-queries.ts   React Query cache invalidation helpers
    utils.ts                cn()
  generated/                Kubb output — clients/, hooks/, types/ (do not edit)
  hooks/  constants/  utils/  test/  assets/
e2e/                        Playwright specs
.storybook/                 Storybook config
kubb.config.ts              Kubb plugins + grouping
components.json             shadcn config
vite.config.ts              alias, vitest projects, dev proxy, ports
playwright.config.ts
```

Path alias: `@/` → `src/`.

## Routing

`router.tsx` mounts `Layout` at `/` with these child routes:

| Path | Page |
|------|------|
| `/` (index) | Dashboard |
| `/projects`, `/projects/:projectId` | Projects, project detail |
| `/experiments`, `/experiments/:experimentId` | Experiments, experiment detail |
| `/samples`, `/samples/:sampleId` | Samples, sample detail |
| `/measurements` | Measurements |
| `/researchers` | Researchers |

Detail pages compose feature components (e.g. `features/experiments/components/experiment-detail`). Keep page components thin.

## API client (Kubb)

`kubb.config.ts` reads `../api/openapi.json` and writes `src/generated/` (cleaned on each run) using:

- `@kubb/plugin-oas`, `@kubb/plugin-ts` → `types/`
- `@kubb/plugin-client` → `clients/` (import path `@/lib/api-client`)
- `@kubb/plugin-react-query` → `hooks/` (`useGet*`, `usePost*`, `usePatch*`, `useDelete*`, plus `*Suspense` variants)

Output is grouped by OpenAPI tag, camelCased as the folder name (`Experiments` → `experiments`).

Consume the generated React Query hooks from `@/generated`. Do not hand-edit `src/generated/`; rerun `bun run codegen` after the API contract changes.

`lib/api-client.ts` is a custom fetch client: it sets a JSON `Content-Type`, builds query strings, and **throws `ApiError` on non-2xx** so failed writes hit React Query's `onError` instead of being reported as success. Base URL comes from `VITE_API_URL`, defaulting to same-origin `/api`.

## Configuration

- `.env.example` → copy to `.env` (local only). `VITE_API_URL` overrides the API base URL; leave unset in dev to use the `/api` proxy.
- shadcn: `components.json` (style `base-nova`, base color `neutral`, lucide icons). Add components with `bunx --bun shadcn@latest add <component>` → lands in `src/components/ui/`.

## Testing

| Target | Command | Location |
|--------|---------|----------|
| Unit | `test:unit` | `src/**/*.test.{ts,tsx}` (jsdom) |
| Storybook | `test:storybook` | `src/**/*.stories.{ts,tsx}` (browser, chromium) |
| E2E | `test:e2e` | `e2e/*.spec.ts` (Playwright; webServer builds + previews on :5173) |

Storybook preview imports `src/index.css` for Tailwind/shadcn styles.
