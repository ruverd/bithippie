# CLAUDE.md — @lab/web

Frontend-specific guidance. Monorepo context: see `/CLAUDE.md`. Product design: `/docs/superpowers/specs/2026-06-25-lab-experiment-tracking-design.md`.

## Purpose

React SPA for the lab experiment tracking system. Currently a **scaffold only** — routing, providers, shadcn, and test tooling are in place; feature pages and Kubb codegen are next.

API base URL (local): `http://localhost:3000`

## Stack

- React 19, Vite 8, TypeScript 6
- Tailwind CSS v4, shadcn/ui (base-nova, `@base-ui/react`)
- React Router DOM, TanStack React Query
- React Hook Form, Zod (v3 — matches `@lab/shared`)
- Kubb (codegen → `src/generated/`)
- Vitest (unit + Storybook browser), Storybook 10, Playwright

## Layout

```
src/
  main.tsx
  app/
    providers.tsx      QueryClientProvider
    layout.tsx         shell + Outlet
    router.tsx         createBrowserRouter
    routes/            page components
  components/ui/       shadcn components
  lib/utils.ts         cn()
  generated/           Kubb output (empty until codegen)
  test/setup.ts
e2e/                   Playwright specs
.storybook/
kubb.config.ts         placeholder — plugins TBD
components.json        shadcn config
vite.config.ts         aliases, vitest projects, dev/preview ports
playwright.config.ts
```

Planned structure (not built yet): `src/features/`, domain components like `MeasurementValueField`, routes for projects/experiments/samples.

Path alias: `@/` → `src/`.

## Commands

Run from `apps/web/` unless noted.

```bash
bun run dev              # :5173
bun run build
bun run preview
bun run test:unit        # jsdom Vitest
bun run test:storybook   # browser Vitest via Storybook
bun run test:e2e         # Playwright (build + preview)
bun run storybook        # :6006
bun run codegen          # kubb generate — needs OpenAPI input
bun run lint             # oxlint
```

From repo root: `bun run dev:web`, `bun run test:web`.

## Providers and routing

- `Providers` wraps the tree with `QueryClientProvider`
- `router.tsx` defines routes; add new pages under `src/app/routes/` and register in the router
- Keep pages thin — compose feature components once they exist

## shadcn

- Config: `components.json` (style: base-nova, icons: lucide)
- Add components: `bunx --bun shadcn@latest add <component>` from `apps/web/`
- Components land in `src/components/ui/`
- Global styles: `src/index.css` (Tailwind + shadcn tokens)

## Kubb (planned)

`kubb.config.ts` points at `../api/openapi.json` and outputs to `src/generated/`. Plugins array is empty — wire `@kubb/plugin-oas`, `@kubb/plugin-ts`, `@kubb/plugin-client`, `@kubb/plugin-zod`, `@kubb/plugin-react-query` when OpenAPI export is ready.

Until codegen runs, do not hand-write API client types that duplicate the OpenAPI contract.

## Validation strategy

Mirror the API's four layers at the UI boundary:

1. Zod/RHF — form shape (reuse `@lab/shared` where possible)
2. React Query — server state, mutations, cache invalidation
3. Generated Kubb hooks — typed requests/responses
4. Backend remains source of truth for business rules

## Testing

| Target | Command | Location |
|--------|---------|----------|
| Unit | `test:unit` | `src/**/*.test.{ts,tsx}` |
| Storybook | `test:storybook` | `src/**/*.stories.{ts,tsx}` |
| E2E | `test:e2e` | `e2e/*.spec.ts` |

E2E uses `build && preview` on `:5173` (see `playwright.config.ts`).

Storybook preview imports `src/index.css` for Tailwind/shadcn styles.

## Conventions

- Minimal diffs; match scaffold patterns
- No code comments unless strictly necessary
- Exhaustive `switch` with `never` default for unions
- Imports at top of file
- Use shadcn components before custom markup
- Semantic Tailwind tokens (`bg-background`, `text-muted-foreground`) — not raw color utilities
- Only commit when explicitly asked

## Next implementation steps

1. Export OpenAPI JSON from API (or fetch `/openapi/json`)
2. Configure Kubb plugins and run `bun run codegen`
3. Add feature folders and routes per design spec
4. Build `MeasurementValueField` (RHF + Zod + shadcn by `valueType`)
5. Playwright flow: projects → project → experiment → create measurement
